-- SAYO 보안 강화 (hardening) — schema.sql 적용 후 실행.
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 Run.
-- 내용: 입력 길이/형식 제한, 자기팔로우 차단, 가입 트리거 충돌 방지, 도배 속도 제한.

-- 1) 입력 검증: 길이/형식 제한 (DB가 최종 방어선) ---------------------------

-- 프로필: 핸들 3~20자(영소문자/숫자/언더스코어), 이름 1~30자, 소개 300자, 색상값 형식
alter table public.profiles drop constraint if exists profiles_handle_format;
alter table public.profiles add constraint profiles_handle_format
  check (handle ~ '^[a-z0-9_]{3,20}$');
alter table public.profiles drop constraint if exists profiles_display_name_len;
alter table public.profiles add constraint profiles_display_name_len
  check (char_length(display_name) between 1 and 30);
alter table public.profiles drop constraint if exists profiles_bio_len;
alter table public.profiles add constraint profiles_bio_len
  check (bio is null or char_length(bio) <= 300);
alter table public.profiles drop constraint if exists profiles_avatar_color_format;
alter table public.profiles add constraint profiles_avatar_color_format
  check (avatar_color is null or avatar_color ~ '^#[0-9a-fA-F]{6}$');

-- 게시물: 본문 1~2000자(공백만은 불가), 이미지 URL은 https 또는 data:image 만, 2048자 이내
alter table public.posts drop constraint if exists posts_body_len;
alter table public.posts add constraint posts_body_len
  check (char_length(body) between 1 and 2000 and btrim(body) <> '');
alter table public.posts drop constraint if exists posts_image_url_safe;
alter table public.posts add constraint posts_image_url_safe
  check (image_url is null or (char_length(image_url) <= 2048
         and (image_url like 'https://%' or image_url like 'data:image/%')));

-- 답글/메시지: 본문 1~1000자
alter table public.replies drop constraint if exists replies_body_len;
alter table public.replies add constraint replies_body_len
  check (char_length(body) between 1 and 1000 and btrim(body) <> '');
alter table public.messages drop constraint if exists messages_body_len;
alter table public.messages add constraint messages_body_len
  check (char_length(body) between 1 and 1000 and btrim(body) <> '');

-- 2) 자기 자신 팔로우/셀프 메시지 차단 --------------------------------------
alter table public.follows drop constraint if exists follows_no_self;
alter table public.follows add constraint follows_no_self
  check (follower_id <> following_id);
alter table public.messages drop constraint if exists messages_no_self;
alter table public.messages add constraint messages_no_self
  check (sender_id <> recipient_id);

-- 3) 가입 트리거 보강: 핸들 정제 + 중복 시 가입이 터지지 않게 fallback ------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_handle text;
  final_handle text;
  base_name text;
begin
  -- 핸들 후보를 규칙(소문자/숫자/_, 3~20자)에 맞게 정제
  base_handle := lower(coalesce(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1)));
  base_handle := regexp_replace(base_handle, '[^a-z0-9_]', '', 'g');
  if char_length(base_handle) < 3 then
    base_handle := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  base_handle := substr(base_handle, 1, 20);

  base_name := coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'), ''), base_handle);
  base_name := substr(base_name, 1, 30);

  -- 중복이면 숫자 접미사 붙여 재시도 (가입 자체가 실패하지 않도록)
  final_handle := base_handle;
  for i in 1..5 loop
    begin
      insert into public.profiles (id, handle, display_name)
      values (new.id, final_handle, base_name)
      on conflict (id) do nothing;
      return new;
    exception when unique_violation then
      final_handle := substr(base_handle, 1, 14) || substr(replace(new.id::text, '-', ''), 1, 6);
    end;
  end loop;
  return new; -- 프로필 생성 실패해도 가입은 통과 (앱에서 보완 가능)
end;
$$;

-- 4) 아이디(@핸들) 변경: 14일에 한 번만 (서버가 강제) -----------------------
alter table public.profiles add column if not exists handle_changed_at timestamptz;

create or replace function public.enforce_handle_cooldown()
returns trigger language plpgsql as $$
begin
  if new.handle is distinct from old.handle then
    if old.handle_changed_at is not null and old.handle_changed_at > now() - interval '14 days' then
      raise exception '아이디는 14일에 한 번만 변경할 수 있어요.';
    end if;
    new.handle_changed_at := now();
  else
    -- 핸들을 안 바꾸면서 변경 시각만 조작하는 꼼수 차단
    new.handle_changed_at := old.handle_changed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists handle_cooldown on public.profiles;
create trigger handle_cooldown before update on public.profiles
  for each row execute function public.enforce_handle_cooldown();

-- 5) 도배 방지: 분당 작성 횟수 제한 (서버 측 rate limit) --------------------
create or replace function public.enforce_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  max_per_min int := tg_argv[0]::int;
  author_col  text := tg_argv[1];
  recent int;
begin
  execute format(
    'select count(*) from public.%I where %I = $1 and created_at > now() - interval ''1 minute''',
    tg_table_name, author_col)
  into recent using auth.uid();
  if recent >= max_per_min then
    raise exception '작성이 너무 빠릅니다. 잠시 후 다시 시도해주세요.';
  end if;
  return new;
end;
$$;

drop trigger if exists rate_limit_posts on public.posts;
create trigger rate_limit_posts before insert on public.posts
  for each row execute function public.enforce_rate_limit('5', 'author_id');

drop trigger if exists rate_limit_replies on public.replies;
create trigger rate_limit_replies before insert on public.replies
  for each row execute function public.enforce_rate_limit('15', 'author_id');

drop trigger if exists rate_limit_messages on public.messages;
create trigger rate_limit_messages before insert on public.messages
  for each row execute function public.enforce_rate_limit('30', 'sender_id');

drop trigger if exists rate_limit_follows on public.follows;
create trigger rate_limit_follows before insert on public.follows
  for each row execute function public.enforce_rate_limit('30', 'follower_id');
