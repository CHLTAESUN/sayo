// SAYO 이메일 인증번호 (Edge Function)
// action: 'issue' → 6자리 코드 생성·저장·메일 발송 / 'check' → 코드 확인
// 메일 발송은 Brevo HTTP API 사용. 발송 서비스 바꾸면 sendEmail()만 교체하면 됨.
//
// 배포: Supabase 대시보드 → Edge Functions → 새 함수 "email-verify" 로 이 코드 붙여넣기.
//        "Enforce JWT verification" 은 OFF.
// 필요한 시크릿(Edge Functions → Secrets):
//   BREVO_API_KEY     = Brevo의 SMTP/API 키
//   BREVO_SENDER       = Brevo에서 인증한 보내는 사람 이메일 (예: 본인 지메일)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 는 기본 제공됨
import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED_ORIGINS = ['https://chltaesun.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const FAIL_MSG = '인증 메일을 보내지 못했어요. 잠시 후 다시 시도해주세요.';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };
}

async function sendEmail(to: string, code: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': Deno.env.get('BREVO_API_KEY')!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: Deno.env.get('BREVO_SENDER')!, name: 'SAYO' },
      to: [{ email: to }],
      subject: `[SAYO] 인증번호 ${code}`,
      htmlContent: `<div style="font-family:sans-serif;font-size:16px;line-height:1.6">
        <p>SAYO 이메일 인증번호입니다.</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
        <p style="color:#888">5분 안에 입력해주세요. 본인이 요청하지 않았다면 무시하세요.</p>
      </div>`,
    }),
  });
  if (!res.ok) throw new Error('brevo send failed');
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: cors });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: FAIL_MSG }, 405);

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return json({ error: FAIL_MSG }, 400);
  }
  const action = body.action;
  const email = (body.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: '이메일 형식이 올바르지 않습니다.' }, 400);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // ① 발급: 1분에 1번만, 6자리 코드, 5분 만료
  if (action === 'issue') {
    const { data: recent } = await admin
      .from('email_codes')
      .select('created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);
    if (recent?.[0] && Date.now() - new Date(recent[0].created_at).getTime() < 60_000) {
      return json({ error: '인증번호는 1분에 한 번만 보낼 수 있어요.' }, 429);
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 5 * 60_000).toISOString();
    const { error } = await admin.from('email_codes').insert({ email, code, expires_at: expires });
    if (error) return json({ error: FAIL_MSG }, 500);
    try {
      await sendEmail(email, code);
    } catch {
      return json({ error: FAIL_MSG }, 502);
    }
    return json({ ok: true });
  }

  // ② 확인: 만료 안 됐고 사용 안 한 가장 최근 코드와 일치하면 통과
  if (action === 'check') {
    const code = (body.code ?? '').trim();
    const { data: rows } = await admin
      .from('email_codes')
      .select('id, code, expires_at, used')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);
    const row = rows?.[0];
    if (!row || row.used || new Date(row.expires_at).getTime() < Date.now()) {
      return json({ error: '인증번호가 만료되었어요. 다시 발급해주세요.' }, 400);
    }
    if (row.code !== code) {
      return json({ error: '인증번호가 일치하지 않습니다.' }, 400);
    }
    await admin.from('email_codes').update({ used: true }).eq('id', row.id);
    return json({ verified: true });
  }

  return json({ error: FAIL_MSG }, 400);
});
