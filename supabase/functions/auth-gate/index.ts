// SAYO 인증 검문소 (Edge Function)
// 가입/로그인 요청을 받아 한국(KR) IP만 통과시킨다. 비한국 IP는 이유를 알려주지 않고 거절.
// 배포: Supabase 대시보드 → Edge Functions → 새 함수 "auth-gate" 로 이 코드 붙여넣기.
//       "Enforce JWT verification" 은 OFF (publishable key는 JWT가 아니라서).
import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED_ORIGINS = ['https://chltaesun.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const DENY_MSG = '지금은 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.';

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };
}

async function countryOf(req: Request): Promise<string> {
  // Supabase 엣지는 Cloudflare 뒤에 있어 cf-ipcountry 헤더가 오는 경우가 많다.
  const direct = req.headers.get('cf-ipcountry');
  if (direct) return direct.toUpperCase();
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  if (!ip) return '';
  try {
    const r = await fetch(`https://ipwho.is/${ip}`);
    const j = await r.json();
    return String(j.country_code ?? '').toUpperCase();
  } catch {
    return ''; // 조회 실패 = 국가 불명 = 거절 (안전한 쪽으로)
  }
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: cors });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: DENY_MSG }, 405);

  // ① 국가 검문: 한국이 아니면 여기서 끝 (이유는 알려주지 않음)
  const country = await countryOf(req);
  if (country !== 'KR') return json({ error: DENY_MSG }, 403);

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return json({ error: DENY_MSG }, 400);
  }
  const { action, email, password, handle, display_name } = body;
  if (!email || !password) return json({ error: DENY_MSG }, 400);

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const anon = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!);

  // ② 가입: 관리자 권한으로 생성(대시보드의 "직접 가입 금지"와 무관하게 동작) + 확인 메일 발송
  if (action === 'signup') {
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { handle, display_name },
    });
    if (error) {
      const msg = /already/i.test(error.message) ? '이미 가입된 이메일입니다.' : DENY_MSG;
      return json({ error: msg }, 400);
    }
    await anon.auth.resend({ type: 'signup', email }).catch(() => {});
    return json({ ok: true });
  }

  // ③ 로그인: 서버에서 검증 후 세션을 돌려준다
  if (action === 'login') {
    const { data, error } = await anon.auth.signInWithPassword({ email, password });
    if (error) return json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' }, 400);
    return json({ session: data.session });
  }

  return json({ error: DENY_MSG }, 400);
});
