// 이메일 인증번호(email-verify Edge Function) 호출.
// 함수 미배포(404)/네트워크 실패 시 { fallback: true } → 화면에서 안내.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function emailVerify(payload) {
  try {
    const res = await fetch(`${url}/functions/v1/email-verify`, {
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
    if (!res.ok) return { error: data.error || '인증 메일 처리에 실패했어요. 잠시 후 다시 시도해주세요.' };
    return data;
  } catch {
    return { fallback: true };
  }
}
