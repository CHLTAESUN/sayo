# Turnstile(봇 차단 캡차) 켜기 — 나중에 컨디션 좋을 때

> 코드는 이미 완성·커밋됨(01f5bbe). 가짜 "로컬 테스트 본인확인"을 Turnstile로 교체.
> 키(VITE_TURNSTILE_SITE_KEY)가 없으면 자동 비활성 → 지금도 사이트는 정상 동작.
> 아래 5개만 하면 켜짐. Claude한테 "Turnstile 이어서 켜자" 하면 도와줌.

## 1. Cloudflare 무료 가입
- https://dash.cloudflare.com/sign-up (가입 페이지가 느릴 수 있음 — 새로고침)
- 이메일+비밀번호로 가입, 카드 X

## 2. Turnstile 사이트 등록 → 키 2개 받기
- 로그인 후 좌측 메뉴 **Turnstile** → **Add site / 위젯 추가**
- 이름: sayo / 도메인(Hostname)에 **chltaesun.github.io** 와 **localhost** 둘 다 추가
- 위젯 모드: **Managed**(기본)
- 만들면 **Site Key**(공개용)와 **Secret Key**(비밀) 2개가 나옴

## 3. Site Key 넣기 (공개 키 — 안전)
- onmaeul/.env 에 추가:  VITE_TURNSTILE_SITE_KEY=0x4AAA...(Site Key)
- GitHub Actions 시크릿에도 추가(라이브 빌드용):
  github.com/CHLTAESUN/sayo → Settings → Secrets and variables → Actions →
  New repository secret → 이름 VITE_TURNSTILE_SITE_KEY, 값 = Site Key
  (그리고 .github/workflows/deploy.yml 빌드 env에 이 변수를 넘기도록 한 줄 추가 — Claude가 해줌)

## 4. Secret Key 넣기 (비밀 — Supabase로)
- Supabase 대시보드 → Authentication → **Attack Protection**
- **Enable CAPTCHA protection** 켜기 → Provider **Turnstile** 선택 → Secret Key 붙여넣기 → 저장
- ⚠️ Secret Key는 채팅에 붙여넣지 말고 그 칸에만.

## 5. 테스트 → 발행
- 로컬 npm run dev → 가입/로그인 화면에 캡차 위젯 뜨고 통과되면 OK
- git push (= 라이브 발행)

## 참고
- 켜기 전: 캡차 비활성(기존처럼 동작). 켠 후: 가입·로그인에 봇 차단 적용.
- 이미 완성된 보안: 이메일 인증번호(작동중), (코드만 있음)한국IP검문 auth-gate·분당 작성제한.
