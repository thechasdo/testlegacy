create type public.invite_permission as enum ('read', 'export');

create table public.legacy_invitations (
  id uuid primary key default gen_random_uuid(),
  legacy_id uuid not null,
  user_id uuid not null,
  token text not null unique,
  recipient_email text not null,
  recipient_name text,
  message text,
  permission public.invite_permission not null default 'read',
  expires_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index legacy_invitations_legacy_idx on public.legacy_invitations(legacy_id);
create index legacy_invitations_token_idx on public.legacy_invitations(token);

alter table public.legacy_invitations enable row level security;

create policy "owners can read invitations" on public.legacy_invitations
  for select to authenticated using (auth.uid() = user_id);
create policy "owners can insert invitations" on public.legacy_invitations
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owners can update invitations" on public.legacy_invitations
  for update to authenticated using (auth.uid() = user_id);
create policy "owners can delete invitations" on public.legacy_invitations
  for delete to authenticated using (auth.uid() = user_id);

create trigger set_updated_at_legacy_invitations
  before update on public.legacy_invitations
  for each row execute function public.tg_set_updated_at();