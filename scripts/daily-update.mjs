/**
 * 경인블루저널 일일 기사 자동 업데이트 스크립트
 * GitHub Actions에서 매일 실행됨
 */

const POCKETBASE_URL = 'http://158.247.210.200:8090';

// 카테고리 ID
const CATEGORIES = {
  politics: 'mq8899s58bf0699',
  economy: 'k9r3229a8774k70',
  society: '05q79x0comk524d',
  culture: '150tdl8949xydgm',
  sports: '2se1eh4n9pdfsc5',
  it: '575wm01lh7c29c6',
};

// 지역 목록 (태그용)
const REGIONS = [
  '경기', '인천', '수원', '성남', '용인', '고양', '화성', '부천',
  '안산', '안양', '남양주', '평택', '의정부', '시흥', '파주', '광명',
  '김포', '군포', '광주', '이천', '양주', '오산', '구리', '안성',
  '포천', '의왕', '하남', '여주', '동두천', '과천', '양평', '가평', '연천'
];

// 경기도/인천 지역 뉴스 RSS 피드 목록
const RSS_FEEDS = [
  { url: 'https://www.gg.go.kr/bbs/rssManager.do?bbsId=BBSMSTR_000000000125', region: '경기', name: '경기도청' },
  { url: 'https://www.incheon.go.kr/rss/IC010000.xml', region: '인천', name: '인천시청' },
];

// 네이버 뉴스 검색 API (대안)
async function searchNaverNews(query) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log('네이버 API 키가 설정되지 않았습니다.');
    return [];
  }

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=10&sort=date`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('네이버 뉴스 검색 실패:', error);
    return [];
  }
}

// PocketBase에 기사 추가
async function createArticle(articleData) {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/articles/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('기사 생성 실패:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('PocketBase 연결 실패:', error);
    return null;
  }
}

// 기사 중복 확인
async function checkDuplicate(slug) {
  try {
    const response = await fetch(
      `${POCKETBASE_URL}/api/collections/articles/records?filter=(slug='${slug}')&perPage=1`
    );

    if (!response.ok) return false;

    const data = await response.json();
    return data.totalItems > 0;
  } catch {
    return false;
  }
}

// 텍스트에서 지역 태그 추출
function extractRegionTags(text) {
  const tags = [];
  for (const region of REGIONS) {
    if (text.includes(region)) {
      tags.push(region);
    }
  }
  return tags;
}

// 카테고리 자동 분류
function categorizeArticle(title, content) {
  const text = `${title} ${content}`.toLowerCase();

  if (/선거|의회|정당|국회|정치/.test(text)) return CATEGORIES.politics;
  if (/기업|일자리|경제|투자|창업|산업/.test(text)) return CATEGORIES.economy;
  if (/축제|문화|예술|공연|전시|관광/.test(text)) return CATEGORIES.culture;
  if (/체육|스포츠|대회|경기/.test(text)) return CATEGORIES.sports;
  if (/ai|스마트|it|과학|기술|디지털/.test(text)) return CATEGORIES.it;

  return CATEGORIES.society; // 기본값
}

// slug 생성
function generateSlug(title) {
  const date = new Date().toISOString().slice(0, 10);
  const cleanTitle = title
    .replace(/[^\w\s가-힣]/g, '')
    .trim()
    .slice(0, 30);

  // 간단한 영문 변환 (실제로는 더 정교한 변환 필요)
  const slug = `news-${date}-${Math.random().toString(36).slice(2, 8)}`;
  return slug;
}

// 메인 실행 함수
async function main() {
  console.log('===== 경인블루저널 일일 업데이트 시작 =====');
  console.log(`실행 시간: ${new Date().toISOString()}`);

  let totalAdded = 0;
  const errors = [];

  // 각 지역별로 뉴스 검색 및 추가
  for (const region of ['경기도', '인천시', '수원시', '성남시', '용인시']) {
    console.log(`\n[${region}] 뉴스 검색 중...`);

    const query = `${region} 보도자료 2026`;
    const newsItems = await searchNaverNews(query);

    if (newsItems.length === 0) {
      console.log(`  - 검색 결과 없음`);
      continue;
    }

    for (const item of newsItems.slice(0, 3)) { // 지역당 최대 3개
      const title = item.title.replace(/<[^>]*>/g, ''); // HTML 태그 제거
      const slug = generateSlug(title);

      // 중복 확인
      if (await checkDuplicate(slug)) {
        console.log(`  - 중복 건너뜀: ${title.slice(0, 30)}...`);
        continue;
      }

      const regionTag = region.replace(/(시|도|군)$/, '');
      const tags = [regionTag, ...extractRegionTags(title)];
      const category = categorizeArticle(title, item.description || '');

      const articleData = {
        title,
        slug,
        summary: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 150),
        content: `<p>${(item.description || '').replace(/<[^>]*>/g, '')}</p>`,
        category,
        status: 'published',
        is_headline: false,
        is_breaking: false,
        views: 0,
        tags: JSON.stringify([...new Set(tags)]),
        published_at: new Date().toISOString(),
      };

      const result = await createArticle(articleData);

      if (result) {
        console.log(`  + 추가됨: ${title.slice(0, 40)}...`);
        totalAdded++;
      }
    }

    // API 속도 제한 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n===== 업데이트 완료 =====');
  console.log(`총 ${totalAdded}개 기사 추가됨`);

  if (errors.length > 0) {
    console.log(`오류 ${errors.length}개 발생`);
  }
}

main().catch(console.error);
