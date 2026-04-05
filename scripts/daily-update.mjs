/**
 * 경인블루저널 일일 기사 자동 업데이트 스크립트
 * 하이브리드 방식: fetch (빠른 사이트) + Playwright (JS 렌더링 필요 사이트)
 *
 * GitHub Actions에서 매일 오전 9시 실행
 */

import * as cheerio from 'cheerio';
import { chromium } from 'playwright';

const POCKETBASE_URL = 'http://158.247.210.200:8090';

// 관리자 인증 토큰 (PATCH/파일 업로드에 필요)
let AUTH_TOKEN = '';

async function authenticateAdmin() {
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('⚠️ 관리자 인증 정보 없음 (이미지 업로드 불가)');
    return;
  }
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      AUTH_TOKEN = data.token;
      console.log('✅ 관리자 인증 성공');
    } else {
      console.log(`⚠️ 관리자 인증 실패: ${res.status}`);
    }
  } catch (error) {
    console.log(`⚠️ 인증 오류: ${error.message}`);
  }
}

// 카테고리 ID
const CATEGORIES = {
  politics: 'mq8899s58bf0699',
  economy: 'k9r3229a8774k70',
  society: '05q79x0comk524d',
  culture: '150tdl8949xydgm',
  sports: '2se1eh4n9pdfsc5',
  it: '575wm01lh7c29c6',
};

// ===== fetch 방식 지자체 (검증 완료) =====
const FETCH_SOURCES = [
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
    name: '양평군',
    tag: '양평',
    listUrl: 'https://www.yp21.go.kr/www/selectBbsNttList.do?bbsNo=2&key=1112',
    baseUrl: 'https://www.yp21.go.kr',
    listSelector: 'table tbody tr',
    titleSelector: 'td a',
    dateSelector: 'td:nth-child(4)',
    linkAttr: 'href',
  },
];

// ===== Playwright 방식 지자체 (JS 렌더링 필요) =====
// listSelector: 기사 목록 행 셀렉터 (없으면 공통 셀렉터 사용)
// titleSelector: 제목/링크 셀렉터 (없으면 'a' 사용)
const PLAYWRIGHT_SOURCES = [
  // 특례시/대도시
  {
    name: '성남시',
    tag: '성남',
    listUrl: 'https://www.seongnam.go.kr/city/1000052/30001/bbsList.do',
    baseUrl: 'https://www.seongnam.go.kr',
  },
  {
    name: '용인시',
    tag: '용인',
    listUrl: 'https://www.yongin.go.kr/user/bbs/BD_selectBbsList.do?q_bbsCode=1020',
    baseUrl: 'https://www.yongin.go.kr',
  },
  {
    name: '고양시',
    tag: '고양',
    listUrl: 'https://www.goyang.go.kr/news/user/bbs/BD_selectBbsList.do?q_bbsCode=1090',
    baseUrl: 'https://www.goyang.go.kr',
  },
  {
    name: '화성시',
    tag: '화성',
    listUrl: 'https://www.hscity.go.kr/www/user/bbs/BD_selectBbsList.do?q_bbsCode=1051',
    baseUrl: 'https://www.hscity.go.kr',
  },
  {
    name: '부천시',
    tag: '부천',
    listUrl: 'https://www.bucheon.go.kr/site/program/board/basicboard/list?boardtypeid=29',
    baseUrl: 'https://www.bucheon.go.kr',
  },
  // 중소도시
  {
    name: '안산시',
    tag: '안산',
    listUrl: 'https://www.ansan.go.kr/www/common/bbs/selectPageListBbs.do?bbs_code=B0238',
    baseUrl: 'https://www.ansan.go.kr',
  },
  {
    name: '안양시',
    tag: '안양',
    listUrl: 'https://www.anyang.go.kr/main/selectBbsNttList.do?bbsNo=73&key=256',
    baseUrl: 'https://www.anyang.go.kr',
  },
  {
    name: '평택시',
    tag: '평택',
    listUrl: 'https://www.pyeongtaek.go.kr/pyeongtaek/bbs/list.do?ptIdx=90&mId=0403060000',
    baseUrl: 'https://www.pyeongtaek.go.kr',
  },
  {
    name: '의정부시',
    tag: '의정부',
    listUrl: 'https://www.ui4u.go.kr/portal/bbs/list.do?ptIdx=1709&mId=0301020000',
    baseUrl: 'https://www.ui4u.go.kr',
  },
  {
    name: '시흥시',
    tag: '시흥',
    listUrl: 'https://www.siheung.go.kr/media/contents.do?mId=0100000000',
    baseUrl: 'https://www.siheung.go.kr',
  },
  {
    name: '파주시',
    tag: '파주',
    listUrl: 'https://www.paju.go.kr/news/user/board/BD_board.list.do?bbsCd=1022',
    baseUrl: 'https://www.paju.go.kr',
  },
  {
    name: '광명시',
    tag: '광명',
    listUrl: 'https://news.gm.go.kr/bbs/list.html?table=bbs_12',
    baseUrl: 'https://news.gm.go.kr',
  },
  {
    name: '김포시',
    tag: '김포',
    listUrl: 'https://www.gimpo.go.kr/news/selectBbsNttList.do?bbsNo=466&key=9377',
    baseUrl: 'https://www.gimpo.go.kr',
  },
  {
    name: '광주시',
    tag: '광주',
    listUrl: 'https://www.gjcity.go.kr/portal/contents.do?mId=0203010000',
    baseUrl: 'https://www.gjcity.go.kr',
  },
  {
    name: '이천시',
    tag: '이천',
    listUrl: 'https://www.icheon.go.kr/news/board/post/list.do?bcIdx=785&mid=0301000000',
    baseUrl: 'https://www.icheon.go.kr',
  },
  {
    name: '양주시',
    tag: '양주',
    listUrl: 'https://www.yangju.go.kr/www/selectGnewsList.do?bscode=S017&key=207',
    baseUrl: 'https://www.yangju.go.kr',
  },
  {
    name: '오산시',
    tag: '오산',
    listUrl: 'https://news.osan.go.kr/main.do',
    baseUrl: 'https://news.osan.go.kr',
  },
  {
    name: '구리시',
    tag: '구리',
    listUrl: 'https://www.guri.go.kr/www/selectBbsNttList.do?bbsNo=42&key=393',
    baseUrl: 'https://www.guri.go.kr',
  },
  {
    name: '안성시',
    tag: '안성',
    listUrl: 'https://www.anseong.go.kr/portal/saeol/newsList.do?mId=0502010100',
    baseUrl: 'https://www.anseong.go.kr',
  },
  {
    name: '의왕시',
    tag: '의왕',
    listUrl: 'https://www.uiwang.go.kr/UWKORINFO0201',
    baseUrl: 'https://www.uiwang.go.kr',
  },
  {
    name: '하남시',
    tag: '하남',
    listUrl: 'https://www.hanam.go.kr/www/selectBbsNttList.do?bbsNo=1164&key=10221',
    baseUrl: 'https://www.hanam.go.kr',
  },
  {
    name: '여주시',
    tag: '여주',
    listUrl: 'https://www.yeoju.go.kr/brd/board/895/L/menu/610',
    baseUrl: 'https://www.yeoju.go.kr',
  },
  {
    name: '과천시',
    tag: '과천',
    listUrl: 'https://www.gccity.go.kr/portal/newsList/list.do?mId=0301140000',
    baseUrl: 'https://www.gccity.go.kr',
  },
  // 군 지역
  {
    name: '가평군',
    tag: '가평',
    listUrl: 'https://www.gp.go.kr/portal/selectBbsNttList.do?bbsNo=127&key=787',
    baseUrl: 'https://www.gp.go.kr',
  },
  {
    name: '연천군',
    tag: '연천',
    listUrl: 'https://www.yeoncheon.go.kr/www/selectBbsNttList.do?bbsNo=29&key=3398',
    baseUrl: 'https://www.yeoncheon.go.kr',
    listSelector: '.p-media-list > li',
  },
  // 광역시/도
  {
    name: '인천시',
    tag: '인천',
    listUrl: 'https://www.incheon.go.kr/IC010205',
    baseUrl: 'https://www.incheon.go.kr',
    listSelector: 'a[href*="/IC010205/view"]',
    linkIsRow: true, // 셀렉터 자체가 링크 요소
  },
  {
    name: '경기도',
    tag: '경기',
    listUrl: 'https://gnews.gg.go.kr/briefing/brief_gongbo.do',
    baseUrl: 'https://gnews.gg.go.kr',
  },
];

// ===== Fetch 방식 함수들 =====

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
      return null;
    }

    return await response.text();
  } catch (error) {
    return null;
  }
}

async function parseFetchArticleList(html, source) {
  try {
    const $ = cheerio.load(html);
    const articles = [];

    const rows = $(source.listSelector);
    if (rows.length === 0) return [];

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

      if (title && link) {
        articles.push({ title, link });
      }
    });

    return articles;
  } catch (error) {
    return [];
  }
}

// ===== Playwright 방식 함수들 =====

async function scrapeWithPlaywright(browser, source) {
  const page = await browser.newPage();
  const articles = [];

  try {
    await page.goto(source.listUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 사이트별 커스텀 셀렉터 우선, 없으면 공통 셀렉터 시도
    const selectors = source.listSelector
      ? [source.listSelector]
      : [
          // 테이블 기반
          'table.board_list tbody tr',
          'table.bbs_list tbody tr',
          'table tbody tr',
          // 리스트 기반
          'ul.board_list > li',
          'ul.bbs_list > li',
          'ul.news_list > li',
          '.list_wrap > li',
          '.board_list > li',
          // 카드/div 기반
          '.news_list .item',
          '.board_list .item',
          '.bbs_default_list li',
          'div.list_item',
          'div.news_item',
          '.card_list > div',
          // 뉴스포털 공통
          '.article_list li',
          '.news_article',
          '.briefing_list li',
          // 범용 폴백
          'article',
          '.board-list tbody tr',
          '[class*="list"] tbody tr',
          '[class*="board"] li',
          '[class*="news"] li',
        ];

    let rows = [];
    for (const selector of selectors) {
      rows = await page.$$(selector);
      // 헤더 행이나 빈 행 제외: 최소 1개 이상의 링크가 있는 행만 카운트
      if (rows.length > 0) {
        const firstHasLink = await rows[0].$('a');
        if (firstHasLink) break;
        rows = [];
      }
    }

    // 셀렉터로 못 찾으면 페이지 내 모든 링크에서 보도자료 패턴 추출 시도
    if (rows.length === 0) {
      const allLinks = await page.$$('a[href]');
      for (const linkEl of allLinks.slice(0, 50)) {
        try {
          const href = await linkEl.getAttribute('href');
          if (!href) continue;
          // 게시판 상세 페이지 패턴 매칭
          const isBoardLink = /(?:view|View|detail|read|nttView|selectBbs|bbscttSn|bbIdx|bIdx|idx=|nttNo|seq=|newsView|repSeq)/.test(href);
          if (!isBoardLink) continue;

          let title = await linkEl.textContent();
          title = title?.trim().replace(/\s+/g, ' ');
          if (!title || title.length < 5) continue;
          // 네비게이션/메뉴 텍스트 제외
          if (/^(이전|다음|처음|마지막|목록|닫기|더보기|로그인|회원가입)$/.test(title)) continue;

          const link = href.startsWith('http') ? href : new URL(href, source.listUrl).href;
          articles.push({ title: title.slice(0, 200), link });
          if (articles.length >= 5) break;
        } catch (e) {
          continue;
        }
      }
      return articles;
    }

    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      try {
        const row = rows[i];

        // 제목과 링크 추출
        // linkIsRow: 셀렉터 자체가 <a> 요소인 경우 (예: 인천시)
        const linkEl = source.linkIsRow
          ? row
          : (source.titleSelector
              ? await row.$(source.titleSelector) || await row.$('a')
              : await row.$('a'));
        if (!linkEl) continue;

        let title = await linkEl.textContent();
        title = title?.trim().replace(/\s+/g, ' ');
        if (!title || title.length < 5) continue;

        let href = await linkEl.getAttribute('href');
        let onclick = await linkEl.getAttribute('onclick');

        let link = null;
        if (href && href !== '#' && !href.startsWith('javascript')) {
          link = href.startsWith('http') ? href : new URL(href, source.listUrl).href;
        } else if (onclick) {
          // onclick에서 URL 추출 시도 (다양한 패턴)
          const urlMatch = onclick.match(/['"]([^'"]*(?:\.do|\.jsp|\.html|view|detail)[^'"]*)['"]/);
          const seqMatch = onclick.match(/(?:fn_detail|goView|jsView|fn_view|viewDetail)\s*\(\s*['"]?(\d+)['"]?/);
          if (urlMatch) {
            link = source.baseUrl + (urlMatch[1].startsWith('/') ? '' : '/') + urlMatch[1];
          } else if (seqMatch) {
            // 일반적인 게시판 상세 URL 패턴 생성
            const listPath = new URL(source.listUrl).pathname;
            const viewPath = listPath.replace(/list/i, 'view').replace(/List/i, 'View');
            link = `${source.baseUrl}${viewPath}?nttNo=${seqMatch[1]}`;
          }
        }

        if (title && link) {
          articles.push({ title: title.slice(0, 200), link });
        }
      } catch (e) {
        continue;
      }
    }
  } catch (error) {
    console.log(`  ! Playwright 오류: ${error.message.slice(0, 50)}`);
  } finally {
    await page.close();
  }

  return articles;
}

async function getArticleDetailWithPlaywright(browser, url) {
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);

    // 본문 추출 - 한국 정부 CMS 공통 패턴 + 사이트별 셀렉터
    const contentSelectors = [
      // 정부 CMS 공통
      '.view_content', '.board_view_content', '.bbs_content',
      '.content_view', '.article_content', '.detail_content',
      '.view-body', '.view_con', '.board_view', '.view-content',
      // 사이트별 발견 셀렉터
      '.postBody',                    // 경기도 gnews
      'td.p-table__content',          // 수원시 등 BD_board 계열
      'td.fulltext',                  // BD_board 계열 변형
      '.bbs_view_content',            // 일부 지자체
      '.bbsV_cont',                   // 일부 지자체
      '.news_content', '.news_view',  // 뉴스포털
      '.bd_detail', '.board_cont',    // 게시판 변형
      '#board_content',               // ID 기반
      '.p-detail',                    // 파주 등
      '.briefing_content',            // 경기도
      '.post_content', '.post_body',  // 뉴스 사이트
      // 범용 폴백
      '#content', 'article',
    ];

    let content = '';
    for (const selector of contentSelectors) {
      const el = await page.$(selector);
      if (el) {
        content = await el.innerHTML();
        if (content && content.length > 50) break;
      }
    }

    // 셀렉터 실패 시: 페이지에서 가장 긴 텍스트 블록 추출
    if (!content || content.length < 50) {
      content = await page.evaluate(() => {
        const candidates = [...document.querySelectorAll('div, td, section')].filter(el => {
          const text = el.textContent.trim();
          return text.length > 100 && text.length < 10000 && el.children.length < 30;
        }).sort((a, b) => {
          // 가장 구체적인(텍스트 길이 대비 HTML이 적은) 요소 선호
          const ratioA = a.innerHTML.length / (a.textContent.trim().length || 1);
          const ratioB = b.innerHTML.length / (b.textContent.trim().length || 1);
          return ratioA - ratioB;
        });
        // 네비게이션/푸터 제외
        const filtered = candidates.filter(el => {
          const cls = (el.className || '').toString().toLowerCase();
          return !cls.includes('nav') && !cls.includes('footer') && !cls.includes('header') && !cls.includes('menu') && !cls.includes('gnb');
        });
        return filtered.length > 0 ? filtered[0].innerHTML : '';
      });
    }

    // 이미지 추출 - OG 이미지 우선 (가장 안정적)
    let imageUrl = null;

    // 1단계: OG/메타 이미지 (가장 신뢰성 높음)
    const metaSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'meta[name="thumbnail"]',
    ];
    for (const sel of metaSelectors) {
      if (imageUrl) break;
      const meta = await page.$(sel);
      if (meta) {
        const src = await meta.getAttribute('content');
        if (src && src.length > 10) {
          imageUrl = src.startsWith('http') ? src : new URL(src, url).href;
        }
      }
    }

    // 2단계: 본문 내 이미지 (여러 개 순회)
    if (!imageUrl) {
      imageUrl = await page.evaluate((pageUrl) => {
        const contentAreas = [
          '.postBody', 'td.p-table__content', 'td.fulltext',
          '.view_content', '.board_view_content', '.bbs_content',
          '.content_view', '.article_content', '.detail_content',
          '.news_content', '.post_content', '.bbs_view_content',
          '#board_content', '#content', 'article',
        ];

        for (const sel of contentAreas) {
          const area = document.querySelector(sel);
          if (!area) continue;
          const imgs = area.querySelectorAll('img');
          for (const img of imgs) {
            const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
            if (!src || src.length < 5) continue;
            // 파일명만 추출하여 필터링 (경로 전체가 아닌)
            const fileName = src.split('/').pop().split('?')[0].toLowerCase();
            if (/^(icon|bullet|btn|logo|arrow|bg|spacer|blank|dot)/.test(fileName)) continue;
            if (/\.(gif|svg)$/i.test(fileName)) continue; // GIF/SVG 제외
            // 너비 체크 (가능한 경우)
            const w = img.naturalWidth || img.width || parseInt(img.getAttribute('width')) || 0;
            if (w > 0 && w < 50) continue; // 50px 미만 제외
            return src.startsWith('http') ? src : new URL(src, pageUrl).href;
          }
        }
        return null;
      }, url);
    }

    // 요약 추출
    let summary = '';
    const descMeta = await page.$('meta[name="description"]');
    if (descMeta) {
      summary = await descMeta.getAttribute('content') || '';
    }

    if (!summary && content) {
      summary = content.replace(/<[^>]*>/g, '').trim().slice(0, 150);
    }

    return {
      content: content || '<p>상세 내용은 원문을 확인해주세요.</p>',
      summary: summary.slice(0, 150),
      imageUrl,
    };
  } catch (error) {
    return null;
  } finally {
    await page.close();
  }
}

// ===== 공통 함수들 =====

async function createArticle(articleData) {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/articles/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function uploadImage(recordId, imageUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(imageUrl).origin,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!imageResponse.ok) return false;

    const imageBuffer = await imageResponse.arrayBuffer();
    if (imageBuffer.byteLength < 1000) return false; // 1KB 최소

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `thumb_${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append('thumbnail', new Blob([imageBuffer], { type: contentType }), fileName);

    const headers = AUTH_TOKEN ? { 'Authorization': AUTH_TOKEN } : {};
    const uploadResponse = await fetch(
      `${POCKETBASE_URL}/api/collections/articles/records/${recordId}`,
      { method: 'PATCH', body: formData, headers }
    );

    return uploadResponse.ok;
  } catch (error) {
    return false;
  }
}

async function checkDuplicate(title) {
  try {
    // 제목 정제 후 검색 (특수문자 제거로 PocketBase 필터 오류 방지)
    const cleanTitle = sanitizeTitle(title)
      .replace(/['"(),\[\]{}<>~!@#$%^&*+=|\\/:;?]/g, '') // PB 필터 깨뜨리는 특수문자 제거
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 20); // 20자로 축소 (더 관대한 매칭)
    if (cleanTitle.length < 5) return false;
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

function categorize(text) {
  if (/선거|의회|정당|국회|시장|군수|구청장|도지사/.test(text)) return CATEGORIES.politics;
  if (/기업|일자리|경제|투자|창업|산업|예산|세금|지원금|고용/.test(text)) return CATEGORIES.economy;
  if (/축제|문화|예술|공연|전시|관광|문화재|박물관/.test(text)) return CATEGORIES.culture;
  if (/체육|스포츠|대회|경기|선수|올림픽/.test(text)) return CATEGORIES.sports;
  if (/ai|AI|스마트|IT|과학|기술|디지털|로봇|드론/.test(text)) return CATEGORIES.it;
  return CATEGORIES.society;
}

// HTML 콘텐츠 정제 - 불필요한 요소 제거
function sanitizeContent(html) {
  if (!html) return '';
  return html
    // script, style, noscript 태그 제거
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    // nav, footer, header, aside 제거
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    // 인라인 JS 이벤트 및 var 선언 제거
    .replace(/\bon\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\bon\w+\s*=\s*'[^']*'/gi, '')
    .replace(/<[^>]*var\s+\w+\s*=[\s\S]*?>/gi, '')
    .replace(/var\s+\w+Props\s*=\s*\{[^}]*\}/g, '')
    // 페이지네이션 패턴 제거
    .replace(/<[^>]*class="[^"]*paginat[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    // 연속 공백/줄바꿈 정리
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

// 제목 정제 - 날짜, 조회수, 부가 텍스트 제거 + 제목/설명 분리
function sanitizeTitle(title) {
  if (!title) return '';
  let clean = title
    // '새글' 태그 제거
    .replace(/^새글\s*/g, '')
    // 날짜 패턴 제거 (2026.04.03, 2026-04-03, 26.3.15.~3.21. 등)
    .replace(/\s*\d{2,4}[.\-/]\d{1,2}[.\-/][\d~.\-/]+\s*/g, ' ')
    // 조회수 제거 (조회 : 123)
    .replace(/\s*조회\s*:?\s*\d+\s*/g, '')
    // 첨부파일 텍스트 제거
    .replace(/첨부파일/g, '')
    // 연속 공백 정리
    .replace(/\s+/g, ' ')
    .trim();

  // 제목+설명 이어붙기 감지 (공백 없이 이어진 경우)
  // 패턴1: 한국어 명사 바로 뒤에 한국어가 공백 없이 이어지는 경우
  const cutPatterns = [
    // "안내XXX에서/는/이" - 안내 뒤 주어 시작
    /^(.{10,}?(?:안내|공고|모집|알림|실시|개최|추진|발표|시행|선정))(?=[가-힣]{2,}(?:시|군|구|청|원|소|과|센터|재단|부|에서|는|이|가|을|를))/,
    // ")2026" 또는 ")제" - 괄호 닫힌 후 설명 시작
    /^(.{10,}?\))\d{4}/,
    // "보고서2025" - 보고서 뒤 연도
    /^(.{10,}?(?:보고서|소식지|결과물|계획서|지침서))\d{4}/,
    // 같은 제목이 공백 없이 반복되는 경우 (첫 번째만)
    /^(.{15,50}?)\1/,
  ];
  for (const pattern of cutPatterns) {
    const match = clean.match(pattern);
    if (match && match[1].length >= 10) {
      clean = match[1];
      break;
    }
  }

  // 최대 70자, 단어 경계에서 자르기
  if (clean.length > 70) {
    const truncated = clean.slice(0, 70);
    const lastSpace = truncated.lastIndexOf(' ');
    clean = lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated;
  }

  return clean;
}

// 요약 정제 - HTML, JS 코드, 불필요한 텍스트 제거
function sanitizeSummary(summary) {
  if (!summary) return '';
  return summary
    .replace(/<[^>]*>/g, '')           // HTML 태그 제거
    .replace(/var\s+\w+\s*=\s*\{[^}]*\}/g, '') // JS 변수 선언 제거
    .replace(/\{[^}]*\}/g, '')         // 중괄호 블록 제거
    .replace(/공지사항|대표\s*홈|오산소식/g, '') // 네비게이션 텍스트 제거
    .replace(/loginId|apiKey|snsProps/g, '') // JS 변수명 제거
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150) || '';
}

function generateSlug() {
  return `news-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

async function processArticle(article, source, browser = null) {
  if (await checkDuplicate(article.title)) {
    console.log(`  - 중복: ${article.title.slice(0, 30)}...`);
    return { added: false, skipped: true };
  }

  let detail = null;
  if (browser) {
    detail = await getArticleDetailWithPlaywright(browser, article.link);
  } else {
    const html = await fetchPage(article.link);
    if (html) {
      const $ = cheerio.load(html);
      let content = '';
      const contentSelectors = ['.view_content', '.board_view_content', '.bbs_content', '.content_view', '.postBody', 'td.p-table__content', 'td.fulltext', '.bbs_view_content', '.news_content', '.detail_content', '.post_content', '#board_content', '#content', 'article'];
      for (const sel of contentSelectors) {
        if ($(sel).length && $(sel).text().trim().length > 50) {
          content = $(sel).html();
          break;
        }
      }
      let imageUrl = null;
      // OG 이미지 우선
      const ogImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
      if (ogImg && ogImg.length > 10) {
        imageUrl = ogImg.startsWith('http') ? ogImg : new URL(ogImg, article.link).href;
      }
      // 본문 이미지 순회
      if (!imageUrl) {
        const imgAreas = '.postBody img, td.p-table__content img, .view_content img, .board_view_content img, .bbs_content img, .content_view img, .news_content img, .detail_content img, #content img, article img';
        $(imgAreas).each((_, el) => {
          if (imageUrl) return false; // break
          const src = $(el).attr('src') || $(el).attr('data-src') || '';
          if (!src || src.length < 5) return;
          const fileName = src.split('/').pop().split('?')[0].toLowerCase();
          if (/^(icon|bullet|btn|logo|arrow|bg|spacer|blank|dot)/.test(fileName)) return;
          if (/\.(gif|svg)$/i.test(fileName)) return;
          imageUrl = src.startsWith('http') ? src : new URL(src, article.link).href;
        });
      }
      detail = { content, summary: content?.replace(/<[^>]*>/g, '').slice(0, 150) || '', imageUrl };
    }
  }

  const cleanTitle = sanitizeTitle(article.title);
  const cleanContent = sanitizeContent(detail?.content);

  const articleData = {
    title: cleanTitle,
    slug: generateSlug(),
    summary: sanitizeSummary(detail?.summary) || cleanTitle.slice(0, 100),
    content: cleanContent || `<p>${cleanTitle}</p><p><a href="${article.link}" target="_blank">원문 보기</a></p>`,
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
    let hasImage = false;
    if (detail?.imageUrl) {
      hasImage = await uploadImage(record.id, detail.imageUrl);
    }
    console.log(`  ✓ 추가 ${hasImage ? '(이미지O)' : '(이미지X)'}: ${article.title.slice(0, 35)}...`);
    return { added: true, hasImage, skipped: false };
  }

  return { added: false, skipped: false };
}

// ===== 메인 함수 =====

async function main() {
  console.log('===== 경인블루저널 일일 업데이트 (하이브리드 방식) =====');
  console.log(`실행 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
  console.log(`Fetch 방식: ${FETCH_SOURCES.length}개 / Playwright 방식: ${PLAYWRIGHT_SOURCES.length}개`);
  console.log('');

  // 관리자 인증 (이미지 업로드에 필요)
  await authenticateAdmin();
  console.log('');

  let totalAdded = 0;
  let totalWithImage = 0;
  let totalSkipped = 0;

  // ===== Phase 1: Fetch 방식 =====
  console.log('📡 [Phase 1] Fetch 방식 수집 시작...\n');

  for (const source of FETCH_SOURCES) {
    console.log(`[${source.name}] 보도자료 수집 중...`);

    const listHtml = await fetchPage(source.listUrl);
    if (!listHtml) {
      console.log(`  - 목록 페이지 접근 실패\n`);
      continue;
    }

    const articles = await parseFetchArticleList(listHtml, source);
    console.log(`  - ${articles.length}개 보도자료 발견`);

    let addedThisSource = 0;
    for (const article of articles) {
      if (addedThisSource >= 3) break; // 지자체당 최대 3개 신규 추가
      const result = await processArticle(article, source, null);
      if (result.added) { totalAdded++; addedThisSource++; }
      if (result.hasImage) totalWithImage++;
      if (result.skipped) totalSkipped++;
      await new Promise(r => setTimeout(r, 500));
    }

    console.log('');
    await new Promise(r => setTimeout(r, 1000));
  }

  // ===== Phase 2: Playwright 방식 =====
  console.log('🌐 [Phase 2] Playwright 방식 수집 시작...\n');

  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    for (const source of PLAYWRIGHT_SOURCES) {
      console.log(`[${source.name}] 보도자료 수집 중...`);

      const articles = await scrapeWithPlaywright(browser, source);
      console.log(`  - ${articles.length}개 보도자료 발견`);

      let addedThisSource = 0;
      for (const article of articles) {
        if (addedThisSource >= 3) break; // 지자체당 최대 3개 신규 추가
        const result = await processArticle(article, source, browser);
        if (result.added) { totalAdded++; addedThisSource++; }
        if (result.hasImage) totalWithImage++;
        if (result.skipped) totalSkipped++;
        await new Promise(r => setTimeout(r, 500));
      }

      console.log('');
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (error) {
    console.error('Playwright 초기화 오류:', error.message);
  } finally {
    if (browser) await browser.close();
  }

  // ===== 결과 출력 =====
  console.log('===== 업데이트 완료 =====');
  console.log(`총 지자체: ${FETCH_SOURCES.length + PLAYWRIGHT_SOURCES.length}개`);
  console.log(`추가: ${totalAdded}개 (이미지 포함: ${totalWithImage}개)`);
  console.log(`중복 스킵: ${totalSkipped}개`);
}

main().catch(error => {
  console.error('스크립트 오류:', error);
  process.exit(1);
});
