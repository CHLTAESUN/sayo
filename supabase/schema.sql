-- SAYO 데이터베이스 스키마 (MVP)
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 Run.
-- 모든 테이블에 RLS(행 수준 보안) 적용: 남의 데이터 함부로 못 건드림.

-- 1) 프로필 (auth.users 와 1:1) -------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  handle       text unique not null,
  display_name text not null,
  bio          text,
  avatar_color text default '#65c6ba',
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "프로필은 누구나 조회" on public.profiles;
drop policy if exists "본인 프로필만 생성" on public.profiles;
drop policy if exists "본인 프로필만 수정" on public.profiles;
create policy "프로필은 누구나 조회" on public.profiles
  for select using (true);
create policy "본인 프로필만 생성" on public.profiles
  for insert with check (auth.uid() = id);
create policy "본인 프로필만 수정" on public.profiles
  for update using (auth.uid() = id);

-- 가입 시 프로필 자동 생성 (이메일 앞부분을 임시 handle/이름으로) ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, handle, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) 게시물 ----------------------------------------------------------------
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  image_url  text,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "게시물은 누구나 조회" on public.posts;
drop policy if exists "로그인 사용자가 본인 글 작성" on public.posts;
drop policy if exists "본인 글만 삭제" on public.posts;
create policy "게시물은 누구나 조회" on public.posts
  for select using (true);
create policy "로그인 사용자가 본인 글 작성" on public.posts
  for insert with check (auth.uid() = author_id);
create policy "본인 글만 삭제" on public.posts
  for delete using (auth.uid() = author_id);

-- 3) 답글 ------------------------------------------------------------------
create table if not exists public.replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

alter table public.replies enable row level security;

drop policy if exists "답글은 누구나 조회" on public.replies;
drop policy if exists "로그인 사용자가 본인 답글 작성" on public.replies;
drop policy if exists "본인 답글만 삭제" on public.replies;
create policy "답글은 누구나 조회" on public.replies
  for select using (true);
create policy "로그인 사용자가 본인 답글 작성" on public.replies
  for insert with check (auth.uid() = author_id);
create policy "본인 답글만 삭제" on public.replies
  for delete using (auth.uid() = author_id);

-- 4) 팔로우 ----------------------------------------------------------------
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

drop policy if exists "팔로우 관계는 누구나 조회" on public.follows;
drop policy if exists "본인 팔로우만 추가" on public.follows;
drop policy if exists "본인 팔로우만 취소" on public.follows;
create policy "팔로우 관계는 누구나 조회" on public.follows
  for select using (true);
create policy "본인 팔로우만 추가" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "본인 팔로우만 취소" on public.follows
  for delete using (auth.uid() = follower_id);

-- 5) 1:1 메시지 (당사자만 조회) --------------------------------------------
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body         text not null,
  created_at   timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "보낸/받은 사람만 메시지 조회" on public.messages;
drop policy if exists "본인이 보내는 메시지만 작성" on public.messages;
create policy "보낸/받은 사람만 메시지 조회" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "본인이 보내는 메시지만 작성" on public.messages
  for insert with check (auth.uid() = sender_id);
