/**
 * 경인블루저널 일일 기사 자동 업데이트 스크립트
 * 지자체 보도자료 직접 수집 방식 (저작권 안전)
 *
 * GitHub Actions에서 매일 오전 9시 실행
 */

import * as cheerio from 'cheerio';

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

// 지자체 보도자료 설정 (실제 동작 확인된 URL)
const GOVERNMENT_SOURCES = [
  // 수원시 - 작동 확인됨
  {
    name: '수원시',
    tag: '수원',
    listUrl: 'https://www.suwon.go.kr/web/board/BD_board.list.do?bbsCd=1042&q_currPage=1',
    baseUrl: 'https://www.suwon.go.kr',
    listSelector: 'table.board_list tbody tr',
    titleSelector: 'td.subject a, td:nth-child(2) a',
    dateSelector: 'td:nth-child(5)',
    linkAttr: 'href',
  },
  // 경기도청
  {
    name: '경기도',
    tag: '경기',
    listUrl: 'https://gnews.gg.go.kr/briefing/brief_gongbo_list.do',
    baseUrl: 'https://gnews.gg.go.kr',
    listSelector: '.board_list tbody tr, table tbody tr',
    titleSelector: 'td.subject a, td a',
    dateSelector: 'td.date, td:nth-child(4)',
    linkAttr: 'href',
  },
  // 화성시
  {
    name: '화성시',
    tag: '화성',
    listUrl: 'https://www.hscity.go.kr/www/user/bbs/BD_selectBbsList.do?q_bbsCode=1020',
    baseUrl: 'https://www.hscity.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td.subject a, td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  // 부천시
  {
    name: '부천시',
    tag: '부천',
    listUrl: 'https://www.bucheon.go.kr/site/program/board/basicboard/list?boardtypeid=24&menuid=148001005002',
    baseUrl: 'https://www.bucheon.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td.subject a, td a',
    dateSelector: 'td.date, td:nth-child(4)',
    linkAttr: 'href',
  },
  // 평택시
  {
    name: '평택시',
    tag: '평택',
    listUrl: 'https://www.pyeongtaek.go.kr/pyeongtaek/bbs/list.do?bbsId=press_release',
    baseUrl: 'https://www.pyeongtaek.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td.subject a, td a',
    dateSelector: 'td.date, td:nth-child(4)',
    linkAttr: 'href',
  },
  // 안산시
  {
    name: '안산시',
    tag: '안산',
    listUrl: 'https://www.ansan.go.kr/www/selectBbsNttList.do?bbsNo=196',
    baseUrl: 'https://www.ansan.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td.subject a, td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  // 남양주시
  {
    name: '남양주시',
    tag: '남양주',
    listUrl: 'https://www.nyj.go.kr/main/5395/5399/bbsList.do',
    baseUrl: 'https://www.nyj.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td.subject a, td a',
    dateSelector: 'td.date, td:nth-child(4)',
    linkAttr: 'href',
  },
  // 시흥시
  {
    name: '시흥시',
    tag: '시흥',
    listUrl: 'https://www.siheung.go.kr/main/bbs/list.do?bbs_code=BBS_0000002',
    baseUrl: 'https://www.siheung.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td.subject a, td a',
    dateSelector: 'td.date, td:nth-child(4)',
    linkAttr: 'href',
  },
];

// HTML 페이지 가져오기
async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`  ! 페이지 로드 실패: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`  ! 타임아웃`);
    } else {
      console.log(`  ! 페이지 접근 오류: ${error.message}`);
    }
    return null;
  }
}

// 보도자료 목록에서 기사 추출
function parseArticleList(html, source) {
  try {
    const $ = cheerio.load(html);
    const articles = [];

    // 여러 셀렉터 시도
    const selectors = source.listSelector.split(',').map(s => s.trim());
    let rows = [];

    for (const selector of selectors) {
      const found = $(selector);
      if (found.length > 0) {
        rows = found;
        break;
      }
    }

    rows.each((i, el) => {
      if (i >= 5) return; // 최대 5개만

      const $el = $(el);

      // 제목 추출 시도
      const titleSelectors = source.titleSelector.split(',').map(s => s.trim());
      let title = '';
      let linkEl = null;

      for (const selector of titleSelectors) {
        const found = $el.find(selector);
        if (found.length && found.text().trim().length > 5) {
          title = found.text().trim();
          linkEl = found;
          break;
        }
      }

      if (!title || title.length < 5) return;

      let link = linkEl?.attr(source.linkAttr) || linkEl?.attr('onclick') || '';

      // onclick에서 URL 추출
      if (link && link.includes('(')) {
        const match = link.match(/['"]([^'"]+)['"]/);
        if (match) link = match[1];
      }

      // 상대 경로를 절대 경로로
      if (link && !link.startsWith('http')) {
        link = source.baseUrl + (link.startsWith('/') ? '' : '/') + link;
      }

      // 날짜 추출
      const dateSelectors = source.dateSelector.split(',').map(s => s.trim());
      let date = '';
      for (const selector of dateSelectors) {
        const found = $el.find(selector);
        if (found.length && found.text().trim()) {
          date = found.text().trim();
          break;
        }
      }

      if (title && link) {
        articles.push({ title: title.replace(/\s+/g, ' '), link, date });
      }
    });

    return articles;
  } catch (error) {
    console.log(`  ! 파싱 오류: ${error.message}`);
    return [];
  }
}

// 기사 상세 페이지에서 내용과 이미지 추출
async function parseArticleDetail(url) {
  const html = await fetchPage(url);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);

    // 본문 내용 추출 (다양한 선택자 시도)
    let content = '';
    const contentSelectors = [
      '.board_view_content',
      '.view_content',
      '.view-body',
      '.bbs_view_content',
      '.content',
      '.board_content',
      '.bbs_content',
      '#content',
      '.article_content',
      'article',
      '.detail_content',
    ];

    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length && el.text().trim().length > 50) {
        content = el.html();
        break;
      }
    }

    // 이미지 추출 (본문 내 첫 번째 이미지)
    let imageUrl = null;
    const imgSelectors = [
      '.board_view_content img',
      '.view_content img',
      '.view-body img',
      '.content img',
      'article img',
      '.bbs_content img',
      '.detail_content img',
    ];

    for (const selector of imgSelectors) {
      const img = $(selector).first();
      if (img.length) {
        const src = img.attr('src');
        if (src && !src.includes('icon') && !src.includes('bullet') && !src.includes('btn')) {
          imageUrl = src;
          if (imageUrl && !imageUrl.startsWith('http')) {
            // 상대 경로를 절대 경로로
            const urlObj = new URL(url);
            imageUrl = urlObj.origin + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
          }
          break;
        }
      }
    }

    // og:image 메타태그 확인 (백업)
    if (!imageUrl) {
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage && !ogImage.includes('logo')) {
        imageUrl = ogImage;
        if (imageUrl && !imageUrl.startsWith('http')) {
          const urlObj = new URL(url);
          imageUrl = urlObj.origin + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
        }
      }
    }

    // 요약 추출
    let summary = $('meta[name="description"]').attr('content') ||
                  $('meta[property="og:description"]').attr('content') ||
                  '';

    if (!summary && content) {
      // HTML 태그 제거하고 첫 150자
      summary = content.replace(/<[^>]*>/g, '').trim().slice(0, 150);
    }

    return {
      content: content || '<p>상세 내용은 원문을 확인해주세요.</p>',
      summary: summary.slice(0, 150),
      imageUrl,
    };
  } catch (error) {
    console.log(`  ! 상세 파싱 오류: ${error.message}`);
    return null;
  }
}

// PocketBase에 기사 생성
async function createArticle(articleData) {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/articles/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`  ! 생성 실패: ${error.slice(0, 80)}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.log(`  ! DB 오류: ${error.message}`);
    return null;
  }
}

// 이미지 업로드
async function uploadImage(recordId, imageUrl) {
  try {
    // 이미지 다운로드
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!imageResponse.ok) return false;

    const imageBuffer = await imageResponse.arrayBuffer();

    // 너무 작은 이미지 스킵 (아이콘 등)
    if (imageBuffer.byteLength < 5000) return false;

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `thumb_${Date.now()}.${ext}`;

    // FormData로 업로드
    const formData = new FormData();
    formData.append('thumbnail', new Blob([imageBuffer], { type: contentType }), fileName);

    const uploadResponse = await fetch(
      `${POCKETBASE_URL}/api/collections/articles/records/${recordId}`,
      {
        method: 'PATCH',
        body: formData,
      }
    );

    return uploadResponse.ok;
  } catch (error) {
    console.log(`  ! 이미지 업로드 실패: ${error.message}`);
    return false;
  }
}

// 중복 확인
async function checkDuplicate(title) {
  try {
    const cleanTitle = title.replace(/['"]/g, '').slice(0, 30);
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

// 카테고리 자동 분류
function categorize(text) {
  if (/선거|의회|정당|국회|시장|군수|구청장|도지사/.test(text)) return CATEGORIES.politics;
  if (/기업|일자리|경제|투자|창업|산업|예산|세금|지원금|고용/.test(text)) return CATEGORIES.economy;
  if (/축제|문화|예술|공연|전시|관광|문화재|박물관/.test(text)) return CATEGORIES.culture;
  if (/체육|스포츠|대회|경기|선수|올림픽/.test(text)) return CATEGORIES.sports;
  if (/ai|AI|스마트|IT|과학|기술|디지털|로봇|드론/.test(text)) return CATEGORIES.it;
  return CATEGORIES.society;
}

// slug 생성
function generateSlug() {
  return `news-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// 메인 함수
async function main() {
  console.log('===== 경인블루저널 일일 업데이트 (지자체 보도자료) =====');
  console.log(`실행 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
  console.log('');

  let totalAdded = 0;
  let totalWithImage = 0;
  let totalSkipped = 0;

  for (const source of GOVERNMENT_SOURCES) {
    console.log(`[${source.name}] 보도자료 수집 중...`);

    // 목록 페이지 가져오기
    const listHtml = await fetchPage(source.listUrl);
    if (!listHtml) {
      console.log(`  - 목록 페이지 접근 실패`);
      continue;
    }

    // 기사 목록 파싱
    const articles = parseArticleList(listHtml, source);
    console.log(`  - ${articles.length}개 보도자료 발견`);

    for (const article of articles.slice(0, 3)) { // 지자체당 최대 3개
      // 중복 확인
      if (await checkDuplicate(article.title)) {
        console.log(`  - 중복: ${article.title.slice(0, 30)}...`);
        totalSkipped++;
        continue;
      }

      // 상세 페이지 파싱
      const detail = await parseArticleDetail(article.link);

      // 기사 데이터 준비
      const articleData = {
        title: article.title.slice(0, 200),
        slug: generateSlug(),
        summary: detail?.summary || article.title.slice(0, 100),
        content: detail?.content || `<p>${article.title}</p><p><a href="${article.link}" target="_blank">원문 보기</a></p>`,
        category: categorize(article.title),
        status: 'published',
        is_headline: false,
        is_breaking: false,
        views: 0,
        tags: [source.tag],
        published_at: new Date().toISOString(),
      };

      // 기사 생성
      const record = await createArticle(articleData);

      if (record) {
        totalAdded++;

        // 이미지 업로드
        if (detail?.imageUrl) {
          const uploaded = await uploadImage(record.id, detail.imageUrl);
          if (uploaded) {
            totalWithImage++;
            console.log(`  + 추가 (이미지 O): ${article.title.slice(0, 35)}...`);
          } else {
            console.log(`  + 추가 (이미지 X): ${article.title.slice(0, 35)}...`);
          }
        } else {
          console.log(`  + 추가 (이미지 X): ${article.title.slice(0, 35)}...`);
        }
      }

      // 속도 제한
      await new Promise(r => setTimeout(r, 1000));
    }

    // 지자체 간 딜레이
    await new Promise(r => setTimeout(r, 2000));
    console.log('');
  }

  console.log('===== 업데이트 완료 =====');
  console.log(`추가: ${totalAdded}개 (이미지 포함: ${totalWithImage}개)`);
  console.log(`중복 스킵: ${totalSkipped}개`);
}

main().catch(error => {
  console.error('스크립트 오류:', error);
  process.exit(1);
});
