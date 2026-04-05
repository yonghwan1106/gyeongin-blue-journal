/**
 * 중복 기사 정리 스크립트
 * 동일 제목의 기사 중 가장 좋은 버전만 남기고 나머지 삭제
 */

const POCKETBASE_URL = 'http://158.247.210.200:8090';

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

async function main() {
  const token = await authenticate();
  const articles = await getAllArticles(token);
  console.log(`총 기사: ${articles.length}건`);

  // 제목 앞 30자 기준으로 그룹화
  const groups = {};
  for (const article of articles) {
    const key = article.title.replace(/['"]/g, '').slice(0, 30);
    if (!groups[key]) groups[key] = [];
    groups[key].push(article);
  }

  // 중복 그룹 찾기
  const duplicates = Object.entries(groups).filter(([, items]) => items.length > 1);
  console.log(`중복 그룹: ${duplicates.length}개\n`);

  let totalDeleted = 0;
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
      const res = await fetch(
        `${POCKETBASE_URL}/api/collections/articles/records/${article.id}`,
        { method: 'DELETE', headers: { 'Authorization': token } }
      );
      if (res.ok) {
        totalDeleted++;
        console.log(`  삭제: ${article.id}`);
      } else {
        console.log(`  삭제 실패: ${article.id} (${res.status})`);
      }
    }
  }

  console.log(`\n===== 정리 완료 =====`);
  console.log(`삭제: ${totalDeleted}건`);
  console.log(`남은 기사: ${articles.length - totalDeleted}건`);
}

main().catch(e => { console.error(e); process.exit(1); });
