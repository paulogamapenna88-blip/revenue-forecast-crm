alter table public.opportunities
  add column if not exists segment text not null default 'Não informado',
  add column if not exists service text not null default 'Não informado';

create table if not exists public.crm_options (
  id bigserial primary key,
  option_type text not null check (option_type in ('segment', 'service')),
  name text not null,
  created_at timestamptz not null default now(),
  unique (option_type, name)
);

alter table public.crm_options enable row level security;

drop policy if exists "Allow anon read crm options pilot" on public.crm_options;
drop policy if exists "Allow anon insert crm options pilot" on public.crm_options;
drop policy if exists "Allow anon update crm options pilot" on public.crm_options;
drop policy if exists "Allow anon delete crm options pilot" on public.crm_options;

create policy "Allow anon read crm options pilot"
  on public.crm_options
  for select
  to anon
  using (true);

create policy "Allow anon insert crm options pilot"
  on public.crm_options
  for insert
  to anon
  with check (true);

create policy "Allow anon update crm options pilot"
  on public.crm_options
  for update
  to anon
  using (true)
  with check (true);

create policy "Allow anon delete crm options pilot"
  on public.crm_options
  for delete
  to anon
  using (true);

insert into public.crm_options (option_type, name)
values
  ('segment', 'Óleo e Gás'),
  ('segment', 'Portos e Terminais'),
  ('segment', 'Navegação'),
  ('segment', 'Indústria'),
  ('segment', 'Energia'),
  ('segment', 'Logística'),
  ('segment', 'Serviços Marítimos'),
  ('service', 'Agenciamento Marítimo'),
  ('service', 'Apoio Portuário'),
  ('service', 'Consultoria Operacional'),
  ('service', 'Gestão de Projetos'),
  ('service', 'Inspeção Técnica'),
  ('service', 'Logística Integrada'),
  ('service', 'Treinamento')
on conflict (option_type, name) do nothing;
