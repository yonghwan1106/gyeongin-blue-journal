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

// 네이버 뉴스 검색 API
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

    if (!response.ok) {
      console.log(`네이버 API 응답 오류: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('네이버 뉴스 검색 실패:', error.message);
    return [];
  }
}

// PocketBase에 기사 추가 (JSON 방식)
async function createArticle(articleData) {
  try {
    const payload = {
      title: articleData.title,
      slug: articleData.slug,
      summary: articleData.summary || '',
      content: articleData.content || '<p>내용을 확인하세요.</p>',
      category: articleData.category,
      status: 'published',
      is_headline: false,
      is_breaking: false,
      views: 0,
      tags: articleData.tags, // 배열 형태로 전송
      published_at: new Date().toISOString(),
    };

    const response = await fetch(`${POCKETBASE_URL}/api/collections/articles/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  ! 생성 실패 (${response.status}): ${errorText.slice(0, 100)}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('  ! PocketBase 연결 실패:', error.message);
    return null;
  }
}

// 기사 중복 확인 (제목 기준)
async function checkDuplicate(title) {
  try {
    // 제목에서 특수문자 제거하고 검색
    const cleanTitle = title.replace(/['"]/g, '').slice(0, 50);
    const response = await fetch(
      `${POCKETBASE_URL}/api/collections/articles/records?filter=(title~'${encodeURIComponent(cleanTitle)}')&perPage=1`
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
  return [...new Set(tags)]; // 중복 제거
}

// 카테고리 자동 분류
function categorizeArticle(title, content) {
  const text = `${title} ${content}`;

  if (/선거|의회|정당|국회|정치|도지사|시장|군수/.test(text)) return CATEGORIES.politics;
  if (/기업|일자리|경제|투자|창업|산업|예산|세금/.test(text)) return CATEGORIES.economy;
  if (/축제|문화|예술|공연|전시|관광|문화재/.test(text)) return CATEGORIES.culture;
  if (/체육|스포츠|대회|경기|선수/.test(text)) return CATEGORIES.sports;
  if (/ai|AI|스마트|IT|과학|기술|디지털|로봇/.test(text)) return CATEGORIES.it;

  return CATEGORIES.society; // 기본값
}

// slug 생성
function generateSlug(title) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return `news-${timestamp}-${random}`;
}

// HTML 태그 제거
function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// 메인 실행 함수
async function main() {
  console.log('===== 경인블루저널 일일 업데이트 시작 =====');
  console.log(`실행 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);

  let totalAdded = 0;
  let totalSkipped = 0;

  // 검색할 지역 목록
  const searchRegions = ['경기도', '인천시', '수원시', '성남시', '용인시', '고양시', '화성시', '부천시'];

  for (const region of searchRegions) {
    console.log(`\n[${region}] 뉴스 검색 중...`);

    const query = `${region} 2026년 1월`;
    const newsItems = await searchNaverNews(query);

    if (newsItems.length === 0) {
      console.log(`  - 검색 결과 없음`);
      continue;
    }

    console.log(`  - ${newsItems.length}개 뉴스 발견`);

    for (const item of newsItems.slice(0, 2)) { // 지역당 최대 2개
      const title = stripHtml(item.title);
      const description = stripHtml(item.description);

      // 중복 확인
      if (await checkDuplicate(title)) {
        console.log(`  - 중복: ${title.slice(0, 35)}...`);
        totalSkipped++;
        continue;
      }

      // 지역 태그 추출
      const regionTag = region.replace(/(시|도|군)$/, '');
      const tags = [regionTag, ...extractRegionTags(title + description)];
      const uniqueTags = [...new Set(tags)].slice(0, 5); // 최대 5개 태그

      const articleData = {
        title: title.slice(0, 200),
        slug: generateSlug(title),
        summary: description.slice(0, 150),
        content: `<p>${description}</p><p><a href="${item.link}" target="_blank">원문 보기</a></p>`,
        category: categorizeArticle(title, description),
        tags: uniqueTags,
      };

      const result = await createArticle(articleData);

      if (result) {
        console.log(`  + 추가: ${title.slice(0, 35)}...`);
        totalAdded++;
      }

      // API 속도 제한 방지
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 지역 간 딜레이
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n===== 업데이트 완료 =====');
  console.log(`추가: ${totalAdded}개 / 중복 스킵: ${totalSkipped}개`);
}

main().catch(error => {
  console.error('스크립트 실행 오류:', error);
  process.exit(1);
});
