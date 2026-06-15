# 새 PC에서 SAYO 세팅하기

이 파일은 `git clone` 하면 같이 따라옵니다. 새 PC에서 이 순서대로 하면 끝.

- 저장소: https://github.com/CHLTAESUN/sayo
- 라이브: https://chltaesun.github.io/sayo/

---

## 1. 처음 한 번만 — 새 PC 준비

1. **Git 설치** → https://git-scm.com
2. **Node.js (LTS) 설치** → https://nodejs.org

PowerShell 새로 열고:

```powershell
git clone https://github.com/CHLTAESUN/sayo.git
cd sayo
npm install
```

> 첫 `git push` 때 GitHub 로그인 창이 뜨면 GitHub 계정으로 로그인.

---

## 2. ⭐ `.env` 파일 만들기 (이게 핵심 — 안 하면 로그인/글쓰기 안 됨)

`sayo` 폴더 안에 `.env` 라는 파일을 새로 만들고 아래 두 줄을 넣으세요:

```
VITE_SUPABASE_URL=https://swhkdzuhsjcticzoteen.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=여기에_publishable_키
```

- **publishable 키**는 Supabase 대시보드 → **Settings → API Keys** 에서 복사
  (publishable 키는 공개돼도 안전한 키)
- ⚠️ `service` / `secret` 키는 절대 넣지 말 것 (코드·GitHub에 올리면 안 됨)
- `.env` 는 일부러 GitHub에 안 올라갑니다(`.gitignore`). 그래서 PC마다 직접 만들어야 함.

---

## 3. 매번 작업할 때 순서

```powershell
git pull          # 시작 전 최신 받기 (필수!)
npm run dev        # 미리보기 (화면에 뜨는 http://localhost 주소 열기)

# ... src/ 안 파일 수정 ...

git add -A
git commit -m "바꾼 내용 한 줄"
git push           # = 인터넷에 발행 (1~2분 뒤 라이브 반영)
```

핵심: **시작 = git pull, 끝 = git push.**

---

## 빠른 체크

- [ ] Git, Node.js 설치함
- [ ] `git clone` + `npm install` 함
- [ ] `.env` 파일 만들고 키 2개 넣음
- [ ] `npm run dev` 로 화면 떠서 로그인 됨

`.env`만 빼먹지 않으면 됩니다.
