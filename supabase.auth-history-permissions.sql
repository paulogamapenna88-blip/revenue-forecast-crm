create table if not exists public.crm_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('manager', 'seller')) default 'seller',
  seller_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_users enable row level security;

drop policy if exists "Allow anon read crm users pilot" on public.crm_users;
drop policy if exists "Allow anon upsert crm users pilot" on public.crm_users;
drop policy if exists "Allow authenticated read crm users" on public.crm_users;
drop policy if exists "Allow authenticated upsert own crm user" on public.crm_users;
drop policy if exists "Allow authenticated update own crm user" on public.crm_users;

create policy "Allow authenticated read crm users"
  on public.crm_users
  for select
  to authenticated
  using (true);

create policy "Allow authenticated upsert own crm user"
  on public.crm_users
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Allow authenticated update own crm user"
  on public.crm_users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.opportunity_history (
  id bigserial primary key,
  opportunity_id text not null references public.opportunities(id) on delete cascade,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id) on delete set null,
  changed_by_name text not null,
  changed_by_email text not null,
  from_stage text,
  to_stage text not null
);

alter table public.opportunity_history enable row level security;

drop policy if exists "Allow authenticated read opportunity history" on public.opportunity_history;
drop policy if exists "Allow authenticated insert opportunity history" on public.opportunity_history;

create policy "Allow authenticated read opportunity history"
  on public.opportunity_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.opportunities o
      join public.crm_users u on u.id = auth.uid()
      where o.id = opportunity_history.opportunity_id
        and (u.role = 'manager' or u.seller_name = o.seller)
    )
  );

create policy "Allow authenticated insert opportunity history"
  on public.opportunity_history
  for insert
  to authenticated
  with check (true);

alter table public.opportunities enable row level security;

drop policy if exists "Allow anon read pilot" on public.opportunities;
drop policy if exists "Allow anon insert pilot" on public.opportunities;
drop policy if exists "Allow anon update pilot" on public.opportunities;
drop policy if exists "Allow anon delete pilot" on public.opportunities;
drop policy if exists "Allow authenticated read" on public.opportunities;
drop policy if exists "Allow authenticated insert" on public.opportunities;
drop policy if exists "Allow authenticated update" on public.opportunities;
drop policy if exists "Allow authenticated delete" on public.opportunities;

create policy "Allow authenticated read"
  on public.opportunities
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and (u.role = 'manager' or u.seller_name = opportunities.seller)
    )
  );

create policy "Allow authenticated insert"
  on public.opportunities
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and (u.role = 'manager' or u.seller_name = opportunities.seller)
    )
  );

create policy "Allow authenticated update"
  on public.opportunities
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and (u.role = 'manager' or u.seller_name = opportunities.seller)
    )
  )
  with check (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and (u.role = 'manager' or u.seller_name = opportunities.seller)
    )
  );

create policy "Allow authenticated delete"
  on public.opportunities
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and u.role = 'manager'
    )
  );

alter table public.crm_options enable row level security;

drop policy if exists "Allow anon read crm options pilot" on public.crm_options;
drop policy if exists "Allow anon insert crm options pilot" on public.crm_options;
drop policy if exists "Allow anon update crm options pilot" on public.crm_options;
drop policy if exists "Allow anon delete crm options pilot" on public.crm_options;
drop policy if exists "Allow authenticated read crm options" on public.crm_options;
drop policy if exists "Allow authenticated insert crm options" on public.crm_options;
drop policy if exists "Allow authenticated update crm options" on public.crm_options;
drop policy if exists "Allow authenticated delete crm options" on public.crm_options;

create policy "Allow authenticated read crm options"
  on public.crm_options
  for select
  to authenticated
  using (true);

create policy "Allow authenticated insert crm options"
  on public.crm_options
  for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update crm options"
  on public.crm_options
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated delete crm options"
  on public.crm_options
  for delete
  to authenticated
  using (true);
