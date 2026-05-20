create table if not exists public.opportunities (
  id text primary key,
  client_name text not null,
  opportunity_name text not null,
  seller text not null,
  value numeric not null default 0,
  entered_at date not null,
  last_interaction_at date not null,
  next_step text not null,
  probability integer not null default 0,
  source text not null,
  lead_type text not null,
  stage text not null,
  priority text not null,
  temperature text not null,
  closed_at date,
  stage_history jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.opportunities enable row level security;

create policy "Allow authenticated read"
  on public.opportunities
  for select
  to authenticated
  using (true);

create policy "Allow authenticated insert"
  on public.opportunities
  for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update"
  on public.opportunities
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated delete"
  on public.opportunities
  for delete
  to authenticated
  using (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists opportunities_set_updated_at on public.opportunities;

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row
execute function public.set_updated_at();
