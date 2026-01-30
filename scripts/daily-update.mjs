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

// 지자체 보도자료 설정 (2026-01-30 URL 검증 완료)
const GOVERNMENT_SOURCES = [
  // ===== 특례시/대도시 (6개) =====
  {
    name: '수원시',
    tag: '수원',
    listUrl: 'https://www.suwon.go.kr/web/board/BD_board.list.do?bbsCd=1042',
    baseUrl: 'https://www.suwon.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td.p-subject a',
    dateSelector: 'td:nth-child(5)',
    linkPattern: (onclick) => {
      const match = onclick?.match(/jsView\('(\d+)',\s*'(\d+)'/);
      if (match) {
        return `https://www.suwon.go.kr/web/board/BD_board.view.do?bbsCd=${match[1]}&seq=${match[2]}`;
      }
      return null;
    },
  },
  {
    name: '성남시',
    tag: '성남',
    listUrl: 'https://www.seongnam.go.kr/city/1000052/30001/bbsList.do',
    baseUrl: 'https://www.seongnam.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '용인시',
    tag: '용인',
    listUrl: 'https://www.yongin.go.kr/news/press/list.do',
    baseUrl: 'https://www.yongin.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '고양시',
    tag: '고양',
    listUrl: 'https://www.goyang.go.kr/www/www05/www0501/www050101.jsp',
    baseUrl: 'https://www.goyang.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '화성시',
    tag: '화성',
    listUrl: 'https://www.hscity.go.kr/www/selectBbsNttList.do?bbsNo=96&key=2871',
    baseUrl: 'https://www.hscity.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '부천시',
    tag: '부천',
    listUrl: 'https://www.bucheon.go.kr/site/program/board/basicboard/list?boardtypeid=29',
    baseUrl: 'https://www.bucheon.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },

  // ===== 중소도시 (22개) =====
  {
    name: '안산시',
    tag: '안산',
    listUrl: 'https://www.ansan.go.kr/www/selectBbsNttList.do?bbsNo=594&key=3032',
    baseUrl: 'https://www.ansan.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '안양시',
    tag: '안양',
    listUrl: 'https://www.anyang.go.kr/main/selectBbsNttList.do?bbsNo=73&key=256',
    baseUrl: 'https://www.anyang.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '남양주시',
    tag: '남양주',
    listUrl: 'https://www.nyj.go.kr/news/selectBbsNttList.do?bbsNo=1&key=2274',
    baseUrl: 'https://www.nyj.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '평택시',
    tag: '평택',
    listUrl: 'https://www.pyeongtaek.go.kr/pyeongtaek/selectBbsNttList.do?bbsNo=8&key=1654',
    baseUrl: 'https://www.pyeongtaek.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '의정부시',
    tag: '의정부',
    listUrl: 'https://www.ui4u.go.kr/portal/bbs/list.do?ptIdx=49&mId=0301010000',
    baseUrl: 'https://www.ui4u.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '시흥시',
    tag: '시흥',
    listUrl: 'https://www.siheung.go.kr/main/selectBbsNttList.do?bbsNo=117&key=649',
    baseUrl: 'https://www.siheung.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '파주시',
    tag: '파주',
    listUrl: 'https://www.paju.go.kr/user/board/BD_board.list.do?bbsCd=1091&q_ctgCd=1001',
    baseUrl: 'https://www.paju.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '광명시',
    tag: '광명',
    listUrl: 'https://www.gm.go.kr/pt/selectBbsNttList.do?bbsNo=91&key=1448',
    baseUrl: 'https://www.gm.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '김포시',
    tag: '김포',
    listUrl: 'https://www.gimpo.go.kr/portal/selectBbsNttList.do?bbsNo=299&key=1499',
    baseUrl: 'https://www.gimpo.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '군포시',
    tag: '군포',
    listUrl: 'https://www.gunpo.go.kr/www/selectBbsNttList.do?bbsNo=685&key=3893',
    baseUrl: 'https://www.gunpo.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '광주시',
    tag: '광주',
    listUrl: 'https://www.gjcity.go.kr/portal/selectBbsNttList.do?bbsNo=88&key=1426',
    baseUrl: 'https://www.gjcity.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '이천시',
    tag: '이천',
    listUrl: 'https://www.icheon.go.kr/portal/selectBbsNttList.do?bbsNo=65&key=1516',
    baseUrl: 'https://www.icheon.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '양주시',
    tag: '양주',
    listUrl: 'https://www.yangju.go.kr/www/selectBbsNttList.do?bbsNo=176&key=2082',
    baseUrl: 'https://www.yangju.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '오산시',
    tag: '오산',
    listUrl: 'https://www.osan.go.kr/portal/contents.do?mId=0301080000',
    baseUrl: 'https://www.osan.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '구리시',
    tag: '구리',
    listUrl: 'https://www.guri.go.kr/cms/selectBbsNttList.do?bbsNo=96&key=498',
    baseUrl: 'https://www.guri.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '안성시',
    tag: '안성',
    listUrl: 'https://www.anseong.go.kr/portal/contents.do?mId=0502010000',
    baseUrl: 'https://www.anseong.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '포천시',
    tag: '포천',
    listUrl: 'https://www.pocheon.go.kr/www/selectBbsNttList.do?bbsNo=243&key=3044',
    baseUrl: 'https://www.pocheon.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '의왕시',
    tag: '의왕',
    listUrl: 'https://www.uiwang.go.kr/portal/selectBbsNttList.do?bbsNo=24&key=1277',
    baseUrl: 'https://www.uiwang.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '하남시',
    tag: '하남',
    listUrl: 'https://www.hanam.go.kr/www/selectBbsNttList.do?bbsNo=26&key=1428',
    baseUrl: 'https://www.hanam.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '여주시',
    tag: '여주',
    listUrl: 'https://www.yeoju.go.kr/brd/board/895/L/menu/610',
    baseUrl: 'https://www.yeoju.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '동두천시',
    tag: '동두천',
    listUrl: 'https://www.ddc.go.kr/ddc/selectBbsNttList.do?bbsNo=95&key=1914',
    baseUrl: 'https://www.ddc.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '과천시',
    tag: '과천',
    listUrl: 'https://www.gccity.go.kr/portal/selectBbsNttList.do?bbsNo=23&key=1248',
    baseUrl: 'https://www.gccity.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },

  // ===== 군 지역 (3개) =====
  {
    name: '양평군',
    tag: '양평',
    listUrl: 'https://www.yp21.go.kr/www/selectBbsNttList.do?bbsNo=2&key=1112',
    baseUrl: 'https://www.yp21.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '가평군',
    tag: '가평',
    listUrl: 'https://www.gp.go.kr/portal/selectBbsNttList.do?bbsNo=72&key=2139',
    baseUrl: 'https://www.gp.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
  {
    name: '연천군',
    tag: '연천',
    listUrl: 'https://www.yeoncheon.go.kr/portal/selectBbsNttList.do?bbsNo=107&key=1590',
    baseUrl: 'https://www.yeoncheon.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },

  // ===== 광역시 (1개) =====
  {
    name: '인천시',
    tag: '인천',
    listUrl: 'https://www.incheon.go.kr/IC010205',
    baseUrl: 'https://www.incheon.go.kr',
    customParser: async (html, source) => {
      const $ = cheerio.load(html);
      const articles = [];

      $('a[href*="/IC010205/view"]').each((i, el) => {
        if (i >= 5) return;

        const $el = $(el);
        const href = $el.attr('href');
        let title = $el.text().trim().replace(/\s+/g, ' ');

        title = title.replace(/이미지 없음/g, '').trim();
        if (title.length < 10 || title.length > 200) return;

        const titlePart = title.split('\n')[0].trim();
        if (titlePart.length < 10) return;

        const link = href.startsWith('http') ? href : source.baseUrl + href;
        articles.push({ title: titlePart, link, date: '' });
      });

      return articles;
    },
  },

  // ===== 경기도청 (1개) =====
  {
    name: '경기도',
    tag: '경기',
    listUrl: 'https://gnews.gg.go.kr/briefing/brief_gongbo_list.do?BS_CODE=S017&section=BRIEF_GG01',
    baseUrl: 'https://gnews.gg.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
];

// HTML 페이지 가져오기
async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

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
async function parseArticleList(html, source) {
  if (source.customParser) {
    return await source.customParser(html, source);
  }

  try {
    const $ = cheerio.load(html);
    const articles = [];

    const rows = $(source.listSelector);
    if (rows.length === 0) {
      return [];
    }

    rows.each((i, el) => {
      if (i >= 5) return;

      const $el = $(el);
      const titleEl = $el.find(source.titleSelector);
      let title = titleEl.text().trim().replace(/\s+/g, ' ');

      if (!title || title.length < 5) return;

      let link = null;
      const onclick = titleEl.attr('onclick');
      const href = titleEl.attr(source.linkAttr || 'href');

      if (onclick && source.linkPattern) {
        link = source.linkPattern(onclick);
      } else if (href && href !== '#') {
        link = href;
        if (!link.startsWith('http')) {
          link = source.baseUrl + (link.startsWith('/') ? '' : '/') + link;
        }
      }

      const dateEl = $el.find(source.dateSelector);
      const date = dateEl.text().trim();

      if (title && link) {
        articles.push({ title, link, date });
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

    let content = '';
    const contentSelectors = [
      '.p-view__content',
      '.board_view_content',
      '.view_content',
      '.view-body',
      '.bbs_view_content',
      '.content_view',
      '.board_content',
      '.bbs_content',
      '.article_content',
      '.detail_content',
      '.content',
      '#content',
      'article',
    ];

    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length && el.text().trim().length > 50) {
        content = el.html();
        break;
      }
    }

    let imageUrl = null;
    const imgSelectors = [
      '.p-view__content img',
      '.board_view_content img',
      '.view_content img',
      '.view-body img',
      '.content_view img',
      '.content img',
      'article img',
      '.bbs_content img',
      '.detail_content img',
    ];

    for (const selector of imgSelectors) {
      const img = $(selector).first();
      if (img.length) {
        const src = img.attr('src');
        if (src && !src.includes('icon') && !src.includes('bullet') && !src.includes('btn') && !src.includes('logo') && !src.includes('bg_')) {
          imageUrl = src;
          if (imageUrl && !imageUrl.startsWith('http')) {
            const urlObj = new URL(url);
            imageUrl = urlObj.origin + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
          }
          break;
        }
      }
    }

    if (!imageUrl) {
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage && !ogImage.includes('logo') && !ogImage.includes('default')) {
        imageUrl = ogImage;
        if (!imageUrl.startsWith('http')) {
          const urlObj = new URL(url);
          imageUrl = urlObj.origin + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
        }
      }
    }

    let summary = $('meta[name="description"]').attr('content') ||
                  $('meta[property="og:description"]').attr('content') ||
                  '';

    if (!summary && content) {
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': imageUrl,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!imageResponse.ok) return false;

    const imageBuffer = await imageResponse.arrayBuffer();
    if (imageBuffer.byteLength < 5000) return false;

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `thumb_${Date.now()}.${ext}`;

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
  console.log(`대상 지자체: ${GOVERNMENT_SOURCES.map(s => s.name).join(', ')}`);
  console.log('');

  let totalAdded = 0;
  let totalWithImage = 0;
  let totalSkipped = 0;
  let successfulSources = 0;

  for (const source of GOVERNMENT_SOURCES) {
    console.log(`[${source.name}] 보도자료 수집 중...`);

    const listHtml = await fetchPage(source.listUrl);
    if (!listHtml) {
      console.log(`  - 목록 페이지 접근 실패`);
      continue;
    }

    const articles = await parseArticleList(listHtml, source);
    console.log(`  - ${articles.length}개 보도자료 발견`);

    if (articles.length > 0) {
      successfulSources++;
    }

    for (const article of articles.slice(0, 2)) {
      if (await checkDuplicate(article.title)) {
        console.log(`  - 중복: ${article.title.slice(0, 30)}...`);
        totalSkipped++;
        continue;
      }

      const detail = await parseArticleDetail(article.link);

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

      const record = await createArticle(articleData);

      if (record) {
        totalAdded++;

        if (detail?.imageUrl) {
          const uploaded = await uploadImage(record.id, detail.imageUrl);
          if (uploaded) {
            totalWithImage++;
            console.log(`  ✓ 추가 (이미지O): ${article.title.slice(0, 35)}...`);
          } else {
            console.log(`  ✓ 추가 (이미지X): ${article.title.slice(0, 35)}...`);
          }
        } else {
          console.log(`  ✓ 추가 (이미지X): ${article.title.slice(0, 35)}...`);
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    await new Promise(r => setTimeout(r, 1500));
    console.log('');
  }

  console.log('===== 업데이트 완료 =====');
  console.log(`성공한 지자체: ${successfulSources}/${GOVERNMENT_SOURCES.length}개`);
  console.log(`추가: ${totalAdded}개 (이미지 포함: ${totalWithImage}개)`);
  console.log(`중복 스킵: ${totalSkipped}개`);
}

main().catch(error => {
  console.error('스크립트 오류:', error);
  process.exit(1);
});
