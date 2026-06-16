-- 이메일 인증번호 저장 테이블.
-- 클라이언트는 절대 못 읽음(RLS 정책 없음 = 전부 거부). Edge Function(service_role)만 접근.
-- Supabase 대시보드 → SQL Editor 에서 이 파일 내용을 실행하세요.

create table if not exists public.email_codes (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  code        text not null,
  expires_at  timestamptz not null,
  used        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists email_codes_lookup
  on public.email_codes (email, created_at desc);

-- RLS 켜고 정책은 만들지 않음 → publishable 키(클라이언트)로는 읽기/쓰기 불가.
-- email-verify Edge Function이 service_role 키로만 접근한다.
alter table public.email_codes enable row level security;
