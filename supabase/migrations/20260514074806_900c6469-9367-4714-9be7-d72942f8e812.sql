
-- ROLES
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "users can read their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

-- updated_at helper
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles are readable by their owner"
  on public.profiles for select to authenticated
  using (auth.uid() = id);
create policy "owners can insert their profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);
create policy "owners can update their profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- LEGACIES
create type public.legacy_plan as enum ('keepsake', 'collector', 'curator');

create table public.legacies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  slug text unique,
  plan public.legacy_plan not null default 'keepsake',
  cover_color text not null default 'pink',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.legacies enable row level security;

create policy "owners can read legacies" on public.legacies for select to authenticated
  using (auth.uid() = user_id);
create policy "owners can insert legacies" on public.legacies for insert to authenticated
  with check (auth.uid() = user_id);
create policy "owners can update legacies" on public.legacies for update to authenticated
  using (auth.uid() = user_id);
create policy "owners can delete legacies" on public.legacies for delete to authenticated
  using (auth.uid() = user_id);

create trigger legacies_updated_at before update on public.legacies
  for each row execute function public.tg_set_updated_at();

-- MEMORIES
create type public.memory_kind as enum ('photo', 'voice', 'letter', 'recipe', 'document');

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  legacy_id uuid references public.legacies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  kind public.memory_kind not null default 'letter',
  title text not null,
  body text,
  media_url text,
  scheduled_for timestamptz,
  tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.memories enable row level security;

create index memories_legacy_idx on public.memories(legacy_id);
create index memories_user_idx on public.memories(user_id);

create policy "owners can read memories" on public.memories for select to authenticated
  using (auth.uid() = user_id);
create policy "owners can insert memories" on public.memories for insert to authenticated
  with check (auth.uid() = user_id);
create policy "owners can update memories" on public.memories for update to authenticated
  using (auth.uid() = user_id);
create policy "owners can delete memories" on public.memories for delete to authenticated
  using (auth.uid() = user_id);

create trigger memories_updated_at before update on public.memories
  for each row execute function public.tg_set_updated_at();
