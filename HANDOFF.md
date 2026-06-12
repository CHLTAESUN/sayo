# SAYO 인수인계 (HANDOFF)

> 다음 세션/다른 에이전트가 맥락 반복 없이 이어받기 위한 문서. **작업 전 이 파일 + CLAUDE.md + SECURITY.md를 먼저 읽는다.**
> Last updated: 2026-06-11 · 작성: Claude Code (Opus 4.8), Codex와 공동 작업

## 1. 프로젝트 한눈에

- **이름:** SAYO (`Say + Open`) — 한국 사용자 대상 공개 대화 중심 커뮤니티(Threads/X 류)
- **위치:** `C:\Users\SBS\Documents\Codex\2026-06-11\new-chat\work\onmaeul`
- **별도 프로젝트:** 데스크탑 `웹사이트 만들기`(담월상점 Astro)와 **무관**
- **성격:** 현재는 **로컬 프로토타입**. 실제 서비스 아님. 계정/세션은 `localStorage`, 게시물은 컴포넌트 state(새로고침 시 사라짐)
- **디자인:** 밝은 민트 배경(`#f8fbfa`), 청록 브랜드(`--sayo: #0f9f91`), Noto Sans KR. 모임 기능 없음
- **git:** GitHub 공개 repo **CHLTAESUN/sayo**에 push 완료. `git pull`→작업→`git push`(=발행).
- **라이브(발행됨):** https://chltaesun.github.io/sayo/ — GitHub Pages 자동배포. **main에 push하면 자동 재배포**(`.github/workflows/deploy.yml`).
  - `vite.config.js` base: 빌드 시 `/sayo/`, 로컬 dev는 `/`(그대로 5173).
  - 배포 빌드의 Supabase 키는 **GitHub Actions 시크릿**(`VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`)으로 주입. `.env`는 로컬 전용(gitignore).
  - ⚠️ **열린 작업:** Supabase 대시보드 Auth→URL Configuration에 `https://chltaesun.github.io/sayo/` 등록해야 라이브 사이트 가입/로그인 리다이렉트 정상.

## 2. 스택 / 실행

- React 18 + Vite 6, `lucide-react` 아이콘. 전체가 **단 2파일**: `src/main.jsx`, `src/styles.css`
- 실행 (PowerShell):
  ```powershell
  $env:Path='C:\Program Files\nodejs;'+$env:Path
  npm run dev -- --host 127.0.0.1 --port 5173
  ```
  미리보기: `http://127.0.0.1:5173`
- **개발 서버 중복 실행 금지** (Codex가 5173에 띄워둠). 파일 수정은 Vite HMR로 자동 반영
- 변경 후 항상 `npm run build` 로 컴파일 확인

## 3. 현재 구현 (전체)

3열 레이아웃(좌 네비 / 가운데 피드 / 우 인기글·메시지) + 모바일 반응형.

- **네비 5탭**(홈/둘러보기/메시지/알림/내 프로필) — `activeNav` 상태로 가운데 영역 전환
  - 데스크탑: 좌측 사이드바 / 모바일(<680px): 하단 고정 탭바 `.mobile-nav`
- **홈** — 글 작성(텍스트+사진), `Post`(별/답글/재게시/인용/저장, 답글 펼치기·접기)
  - 피드 탭(추천/팔로잉/최신) 실제 동작
- **둘러보기** — 지금 뜨는 이야기(트렌드 카드) + 추천하는 사람(FollowButton)
- **메시지** — 대화 목록, 클릭 시 우하단 채팅창
- **알림** — 별/팔로우/답글/재게시/인용 알림 목록
- **내 프로필** — 커버·아바타·소개·통계 + 내가 쓴 글
- **검색** — 데스크탑 버튼/모바일 아이콘 → 모달, people·popularPosts 실시간 필터
- **인용** — 인용 버튼 → 박스 → 코멘트+원본 임베드 카드 담은 새 글 생성
- **회원가입 5단계**(이메일 인증 → 로컬 본인확인 → 비번 → 프로필 → 공개범위/약관 → 관심주제) + 로그인. 완료된 인증 단계는 자동 접힘

## 4. 코드 지도 (`src/main.jsx`)

- 모듈 상수: `navItems`, `people`, `popularPosts`, `me`, `notifications`, `seedPosts`(시드 게시글 2개 데이터), `initialMessages`
- 컴포넌트: `Avatar`, `FollowButton`, `Post`(props: author/time/text/image/initialLikes/initialReplies/repostedBy/**quoted**/**onQuote**), `App`
- `App` 핵심 상태: `activeNav`, `feedTab`, `searchOpen`/`searchQuery`, `chatOpen`, `selectedPerson`, `messages`, `localPosts`(내 글), `postText`/`photo`, 회원가입 관련 다수
- `App` 파생값: `view`(탭별 제목/부제), `ownPosts`+`seedPosts`→`visiblePosts`(탭별 정렬/필터), `peopleResults`/`topicResults`(검색)
- 홈 피드는 `visiblePosts.map`로 단일 렌더(시드 글 하드코딩 JSX 제거됨)

피드 탭 규칙: **추천**=`initialLikes` 내림차순 · **최신**=배열 순(내 글 최신 먼저) · **팔로잉**=`follows || own`만

## 5. 이번 세션에 Claude가 한 것 (모두 검증됨)

1. 죽어있던 네비 탭 4개 → 실제 뷰 전환
2. 모바일 하단 탭바
3. 검색 모달
4. 인용 기능
5. 피드 탭 상태화 + 시드 글 `seedPosts` 배열 추출 + 홈 피드 단일화

검증: `npm run build` 통과, 콘솔 에러 0, DOM 검증(5탭 전환 / 검색 필터+클릭이동 / 인용 글 생성 / 피드탭 3종 차등 결과 / 내 글 통합).
참고: 미리보기 스크린샷 도구는 이 환경에서 타임아웃 → DOM 검증으로 대체.

## 6. 공동 편집 규칙 (Codex와 동시 작업)

- 수정 **전 최신 파일 다시 읽기**(Codex가 같은 파일 편집 가능)
- 사용자 요청 범위 밖 기존 변경 **되돌리지 않기**, 기존 스타일 따르기
- 개발 서버(5173) **중복 실행 금지**, 변경 후 `npm run build`
- 주로 만지는 파일: `src/main.jsx`, `src/styles.css`

## 7. 보안 (운영 전환 시) — 자세한 건 SECURITY.md

- 브라우저에서 DB 직접 접근 금지. 흐름: 사용자 → Cloudflare WAF(한국 IP만) → SAYO 서버 API → Supabase(Auth/PG/Storage)
- PASS/휴대폰 본인인증 필수, **주민번호 원문 절대 미수집**, CI는 단방향/암호화
- 사진: 실제 MIME 검사·재인코딩·EXIF 제거, SVG/HTML/실행파일 금지
- 현재 가입의 "로컬 본인확인"은 **테스트 전용** — 실제 인증 아님

## 8. 다음 작업 후보 (우선순위)

1. 모바일 상단 `Menu` 아이콘 — 연결하거나 제거(현재 무동작)
2. `기분(Smile)` 버튼, 알림/인기글 `더 보기` 버튼 동작
3. **git init + 첫 커밋** (현재 git 없음)
4. 운영 백엔드 착수 (SECURITY.md 구조: Supabase + 서버 API + Cloudflare)

## 9. 관련 메모리

- 진행/기능 상태: Obsidian vault `00_HOME/progress.txt`, `00_HOME/feture_list.json`(feature id: `sayo-community-site`)
