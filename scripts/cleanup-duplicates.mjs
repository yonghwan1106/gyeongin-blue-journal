/**
 * 기사 정리 스크립트
 * 1. 404 에러 콘텐츠 기사 삭제
 * 2. var snsProps / loginId 포함 summary 기사 정리 (PATCH)
 * 3. 썸네일 없는 기사 삭제
 * 4. 중복 기사 정리
 */

const POCKETBASE_URL = 'http://158.247.210.200:8090';

const ERROR_CONTENT_KEYWORDS = ['찾을 수 없습니다', '에러페이지', '404', '잘못 입력되었거나'];
const JUNK_SUMMARY_KEYWORDS = ['var snsProps', 'loginId'];

async function authenticate() {
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('⚠️ POCKETBASE_ADMIN_EMAIL/PASSWORD 환경변수 필요');
    process.exit(1);
  }
  const res = await fetch(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  });
  if (!res.ok) { console.log('인증 실패:', res.status); process.exit(1); }
  const data = await res.json();
  console.log('✅ 인증 성공');
  return data.token;
}

async function getAllArticles(token) {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${POCKETBASE_URL}/api/collections/articles/records?perPage=200&page=${page}&sort=-published_at`,
      { headers: { 'Authorization': token } }
    );
    const data = await res.json();
    all = all.concat(data.items);
    if (page >= data.totalPages) break;
    page++;
  }
  return all;
}

async function deleteArticle(token, id) {
  const res = await fetch(
    `${POCKETBASE_URL}/api/collections/articles/records/${id}`,
    { method: 'DELETE', headers: { 'Authorization': token } }
  );
  return res.ok;
}

async function patchSummary(token, id, summary) {
  const res = await fetch(
    `${POCKETBASE_URL}/api/collections/articles/records/${id}`,
    {
      method: 'PATCH',
      headers: { 'Authorization': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary }),
    }
  );
  return res.ok;
}

// 1단계: 404 에러 콘텐츠 기사 삭제
async function deleteErrorArticles(token, articles) {
  console.log('\n===== [1단계] 404 에러 콘텐츠 기사 삭제 =====');
  const targets = articles.filter(a =>
    ERROR_CONTENT_KEYWORDS.some(kw => (a.content || '').includes(kw))
  );
  console.log(`대상 기사: ${targets.length}건`);

  let deleted = 0;
  for (const article of targets) {
    const ok = await deleteArticle(token, article.id);
    if (ok) {
      deleted++;
      console.log(`  삭제: ${article.id} | ${article.title?.slice(0, 40)}`);
    } else {
      console.log(`  삭제 실패: ${article.id}`);
    }
  }
  console.log(`1단계 완료: ${deleted}건 삭제`);
  return new Set(targets.map(a => a.id));
}

// 2단계: var snsProps / loginId 포함 summary 정리 (title 앞 100자로 PATCH)
async function fixJunkSummaries(token, articles, deletedIds) {
  console.log('\n===== [2단계] 잘못된 summary 기사 정리 =====');
  const targets = articles.filter(a =>
    !deletedIds.has(a.id) &&
    JUNK_SUMMARY_KEYWORDS.some(kw => (a.summary || '').includes(kw))
  );
  console.log(`대상 기사: ${targets.length}건`);

  let patched = 0;
  for (const article of targets) {
    const newSummary = (article.title || '').slice(0, 100);
    const ok = await patchSummary(token, article.id, newSummary);
    if (ok) {
      patched++;
      console.log(`  수정: ${article.id} | summary -> "${newSummary}"`);
    } else {
      console.log(`  수정 실패: ${article.id}`);
    }
  }
  console.log(`2단계 완료: ${patched}건 수정`);
}

// 3단계: 썸네일 없는 기사 삭제
async function deleteNoThumbnailArticles(token, articles, deletedIds) {
  console.log('\n===== [3단계] 썸네일 없는 기사 삭제 =====');
  const targets = articles.filter(a =>
    !deletedIds.has(a.id) && !a.thumbnail
  );
  console.log(`대상 기사: ${targets.length}건`);

  let deleted = 0;
  for (const article of targets) {
    const ok = await deleteArticle(token, article.id);
    if (ok) {
      deleted++;
      deletedIds.add(article.id);
      console.log(`  삭제: ${article.id} | ${article.title?.slice(0, 40)}`);
    } else {
      console.log(`  삭제 실패: ${article.id}`);
    }
  }
  console.log(`3단계 완료: ${deleted}건 삭제`);
  return deleted;
}

// 4단계: 중복 기사 정리
async function deleteDuplicates(token, articles, deletedIds) {
  console.log('\n===== [4단계] 중복 기사 정리 =====');
  const remaining = articles.filter(a => !deletedIds.has(a.id));

  // 제목 앞 30자 기준으로 그룹화
  const groups = {};
  for (const article of remaining) {
    const key = article.title.replace(/['"]/g, '').slice(0, 30);
    if (!groups[key]) groups[key] = [];
    groups[key].push(article);
  }

  const duplicates = Object.entries(groups).filter(([, items]) => items.length > 1);
  console.log(`중복 그룹: ${duplicates.length}개`);

  let deleted = 0;
  for (const [key, items] of duplicates) {
    // 가장 좋은 버전 선택: 썸네일 있는 것 > 콘텐츠 긴 것 > 최신 것
    items.sort((a, b) => {
      if (a.thumbnail && !b.thumbnail) return -1;
      if (!a.thumbnail && b.thumbnail) return 1;
      if ((a.content?.length || 0) !== (b.content?.length || 0)) {
        return (b.content?.length || 0) - (a.content?.length || 0);
      }
      return new Date(b.published_at) - new Date(a.published_at);
    });

    const keep = items[0];
    const toDelete = items.slice(1);

    console.log(`[${key.slice(0, 25)}...] ${items.length}건 → 보존: ${keep.id} (thumb:${keep.thumbnail ? 'O' : 'X'}, ${keep.content?.length || 0}자)`);

    for (const article of toDelete) {
      const ok = await deleteArticle(token, article.id);
      if (ok) {
        deleted++;
        console.log(`  삭제: ${article.id}`);
      } else {
        console.log(`  삭제 실패: ${article.id} (삭제 실패)`);
      }
    }
  }
  console.log(`4단계 완료: ${deleted}건 삭제`);
  return deleted;
}

async function main() {
  const token = await authenticate();
  const articles = await getAllArticles(token);
  console.log(`총 기사: ${articles.length}건`);

  const deletedIds = new Set();

  // 1단계: 404 에러 콘텐츠 기사 삭제
  const errorDeletedIds = await deleteErrorArticles(token, articles);
  errorDeletedIds.forEach(id => deletedIds.add(id));

  // 2단계: 잘못된 summary 수정
  await fixJunkSummaries(token, articles, deletedIds);

  // 3단계: 썸네일 없는 기사 삭제
  await deleteNoThumbnailArticles(token, articles, deletedIds);

  // 4단계: 중복 기사 삭제
  await deleteDuplicates(token, articles, deletedIds);

  console.log('\n===== 전체 정리 완료 =====');
  console.log(`처리 전 기사: ${articles.length}건`);
  console.log(`삭제된 기사: ${deletedIds.size}건`);
  console.log(`남은 기사(추정): ${articles.length - deletedIds.size}건`);
}

main().catch(e => { console.error(e); process.exit(1); });
