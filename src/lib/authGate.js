// 인증 검문소(auth-gate Edge Function) 호출.
// 검문소가 아직 배포되지 않았으면(404/네트워크 실패) { fallback: true }를 돌려줘
// 기존 직접 인증으로 동작한다 — 배포 전에도 사이트가 깨지지 않게.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function gateAuth(payload) {
  try {
    const res = await fetch(`${url}/functions/v1/auth-gate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 404) return { fallback: true };
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || '지금은 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.' };
    return data;
  } catch {
    return { fallback: true };
  }
}
