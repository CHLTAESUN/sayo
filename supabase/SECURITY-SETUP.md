# SAYO 보안 설정 가이드 (무료 최대치)

코드는 전부 준비돼 있고, Supabase 대시보드에서 아래 스위치만 켜면 작동합니다.
순서대로 하세요. 전부 무료입니다.

## ✅ 이미 적용된 것 (코드/사이트)

- CSP — 허용한 곳 외 스크립트/접속 차단
- DB 방어벽 SQL — `hardening.sql` (글자수 제한, 도배 방지, 핸들 규칙 등) ← **SQL Editor에서 실행 필요**
- 검문소 코드 — 가입·로그인을 한국 IP만 통과 (`functions/auth-gate/index.ts`) ← **아래 1번으로 배포 필요**
- 사이트 코드 — 검문소를 먼저 거치고, 검문소가 없으면 기존 방식으로 동작(안 깨짐)

## 1. 검문소(auth-gate) 배포 — 한국 IP만 가입/로그인

1. Supabase 대시보드 → 왼쪽 **Edge Functions** 클릭
2. **Deploy a new function** (또는 Create function) → 이름: `auth-gate`
3. 편집기에 `supabase/functions/auth-gate/index.ts` 파일 내용 전체를 붙여넣기
4. **Deploy** 클릭
5. 함수 상세 화면에서 **"Enforce JWT verification" 을 OFF** 로 (Details/Settings 안에 있음)
   - 이유: 우리 사이트는 새 방식 키(publishable)를 쓰는데 이 옵션은 옛 방식 키만 통과시켜서, 켜져 있으면 한국 사용자도 막힘

**확인 방법:** 배포 후 사이트에서 로그인 시도 → 정상 로그인되면 성공.
(한국에서 하면 통과되는 게 정상이에요. 차단은 해외 IP에만 걸립니다.)

## 2. 직접 가입 구멍 막기 — 반드시 1번 후에!

검문소를 우회해 Supabase에 직접 가입하는 꼼수를 차단합니다.

1. 대시보드 → **Authentication** → **Sign In / Providers** (또는 Providers → Email)
2. **"Allow new users to sign up" 을 OFF**
3. 이제 가입은 검문소(한국 IP)를 통해서만 가능

⚠️ 1번(검문소 배포)보다 먼저 끄면 아무도 가입 못 하게 되니 순서 지키기.

## 3. 유출된 비밀번호 차단 (클릭 한 번)

1. 대시보드 → **Authentication** → **Attack Protection** (또는 Passwords 설정)
2. **"Leaked password protection" 켜기**
   - 해킹으로 유출된 적 있는 비밀번호("123456" 등)로는 가입 자체가 안 됨

## 4. hardening.sql 실행 (아직 안 했다면)

1. 대시보드 → **SQL Editor**
2. `supabase/hardening.sql` 내용 전체 붙여넣고 **Run**

## 알아둘 한계 (솔직한 기록)

- **사이트 구경**은 해외에서도 가능 — 막으려면 도메인+Cloudflare 필요 (유료, 발행 직전에)
- **한국 VPN 위장**은 IP로는 못 막음 — 발행 직전 PASS 본인인증으로 해결 (유료)
- 로그인 검문은 사이트 화면 기준 — API를 직접 두드리는 기술자는 로그인 우회 가능
  (가입은 2번 스위치로 완전 차단됨. 로그인까지 완전 차단은 PASS/MFA 단계에서)
- 봇 차단(CAPTCHA/Turnstile)은 Cloudflare 계정이 필요해서 다음 단계로 미룸

## 발행 직전 단계 (유료, 나중에)

1. 도메인 + Cloudflare → 사이트 자체를 한국에서만 열리게 (WAF)
2. PASS 휴대폰 본인인증 → VPN 위장 원천 차단 (사업자등록 필요)
3. Turnstile 봇 차단
