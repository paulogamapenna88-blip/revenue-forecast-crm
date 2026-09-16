-- Migração: bases operacionais independentes + base-mãe de clientes.
-- Execute este arquivo no SQL Editor do Supabase.

create table if not exists public.crm_business_units (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.crm_business_units (id, name)
values
  ('freight_projects', 'Freight Forwarder e Projetos'),
  ('maritime_port', 'Serviços Marítimos e Portuários')
on conflict (id) do update
set name = excluded.name;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null unique,
  trade_name text,
  tax_id text,
  focal_point text,
  company_phone text,
  contact_email text,
  address text,
  postal_code text,
  segment text,
  website text,
  city text,
  state text,
  country text not null default 'Brasil',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients
  add column if not exists trade_name text;

alter table public.clients
  add column if not exists tax_id text;

alter table public.clients
  add column if not exists focal_point text;

alter table public.clients
  add column if not exists company_phone text;

alter table public.clients
  add column if not exists contact_email text;

alter table public.clients
  add column if not exists address text;

alter table public.clients
  add column if not exists postal_code text;

alter table public.clients
  add column if not exists segment text;

alter table public.clients
  add column if not exists website text;

alter table public.clients
  add column if not exists city text;

alter table public.clients
  add column if not exists state text;

alter table public.clients
  add column if not exists country text not null default 'Brasil';

alter table public.clients
  add column if not exists notes text;

alter table public.clients
  drop constraint if exists clients_required_contact_check;

alter table public.clients
  add constraint clients_required_contact_check
  check (
    focal_point is null
    or (
      trim(focal_point) <> ''
      and coalesce(trim(company_phone), '') <> ''
      and coalesce(trim(contact_email), '') <> ''
    )
  );

alter table public.crm_users
  add column if not exists allowed_business_units text[] not null default array['freight_projects']::text[];

alter table public.crm_users
  drop constraint if exists crm_users_role_check;

alter table public.crm_users
  add constraint crm_users_role_check
  check (role in ('admin', 'manager', 'seller'));

alter table public.crm_users
  drop constraint if exists crm_users_allowed_business_units_check;

alter table public.crm_users
  add constraint crm_users_allowed_business_units_check
  check (allowed_business_units <@ array['freight_projects', 'maritime_port']::text[]);

alter table public.opportunities
  add column if not exists business_unit text not null default 'freight_projects';

alter table public.opportunities
  add column if not exists client_id uuid references public.clients(id);

alter table public.opportunities
  add column if not exists next_action_date date;

alter table public.opportunities
  add column if not exists loss_reason text;

alter table public.opportunities
  add column if not exists original_segment text;

update public.opportunities
set original_segment = segment
where original_segment is null
  and segment not in ('Serviços Portuários', 'Serviços Marítimos', 'Freight Forwarder', 'Projetos');

alter table public.opportunities
  drop constraint if exists opportunities_business_unit_check;

alter table public.opportunities
  add constraint opportunities_business_unit_check
  check (business_unit in ('freight_projects', 'maritime_port'));

alter table public.opportunities
  drop constraint if exists opportunities_loss_reason_check;

alter table public.opportunities
  add constraint opportunities_loss_reason_check
  check (
    loss_reason is null
    or loss_reason in ('preço', 'concorrência', 'timing', 'sem fit', 'sem oferta', 'desistência', 'prazo', 'outro')
  );

update public.opportunities
set segment = case
  when lower(segment) in ('portos e terminais', 'serviços portuários', 'apoio portuário') then 'Serviços Portuários'
  when lower(segment) in ('serviços marítimos', 'navegação', 'óleo e gás', 'energia') then 'Serviços Marítimos'
  when lower(segment) in ('freight forwarder', 'logística', 'logistica') then 'Freight Forwarder'
  when segment in ('Serviços Portuários', 'Serviços Marítimos', 'Freight Forwarder', 'Projetos') then segment
  else 'Projetos'
end;

alter table public.opportunities
  drop constraint if exists opportunities_segment_check;

alter table public.opportunities
  add constraint opportunities_segment_check
  check (segment in ('Serviços Portuários', 'Serviços Marítimos', 'Freight Forwarder', 'Projetos'));

update public.opportunities
set next_action_date = last_interaction_at
where next_action_date is null
  and stage not like 'Fechado%';

alter table public.crm_options
  add column if not exists segment text not null default 'global';

alter table public.crm_options
  drop constraint if exists crm_options_option_type_name_key;

alter table public.crm_options
  drop constraint if exists crm_options_option_type_name_segment_key;

update public.crm_options
set segment = case
  when option_type <> 'service' then 'global'
  when lower(name) in ('apoio portuário', 'operacao portuaria', 'operação portuária', 'armazenagem', 'inspeção em terminal') then 'Serviços Portuários'
  when lower(name) in ('agenciamento marítimo', 'consultoria operacional', 'inspeção técnica', 'apoio marítimo') then 'Serviços Marítimos'
  when lower(name) in ('frete internacional', 'desembaraço aduaneiro', 'logística integrada', 'carga projeto') then 'Freight Forwarder'
  else 'Projetos'
end;

alter table public.crm_options
  drop constraint if exists crm_options_segment_check;

alter table public.crm_options
  add constraint crm_options_segment_check
  check (segment in ('global', 'Serviços Portuários', 'Serviços Marítimos', 'Freight Forwarder', 'Projetos'));

alter table public.crm_options
  add constraint crm_options_option_type_name_segment_key
  unique (option_type, name, segment);

insert into public.crm_options (option_type, name, segment)
values
  ('service', 'Apoio Portuário', 'Serviços Portuários'),
  ('service', 'Operação Portuária', 'Serviços Portuários'),
  ('service', 'Armazenagem', 'Serviços Portuários'),
  ('service', 'Inspeção em Terminal', 'Serviços Portuários'),
  ('service', 'Agenciamento Marítimo', 'Serviços Marítimos'),
  ('service', 'Consultoria Operacional', 'Serviços Marítimos'),
  ('service', 'Inspeção Técnica', 'Serviços Marítimos'),
  ('service', 'Apoio Marítimo', 'Serviços Marítimos'),
  ('service', 'Frete Internacional', 'Freight Forwarder'),
  ('service', 'Desembaraço Aduaneiro', 'Freight Forwarder'),
  ('service', 'Logística Integrada', 'Freight Forwarder'),
  ('service', 'Carga Projeto', 'Freight Forwarder'),
  ('service', 'Gestão de Projetos', 'Projetos'),
  ('service', 'Treinamento', 'Projetos'),
  ('service', 'Implantação Operacional', 'Projetos'),
  ('service', 'Consultoria Especializada', 'Projetos')
on conflict (option_type, name, segment) do nothing;

update public.crm_users
set allowed_business_units = array['freight_projects', 'maritime_port']::text[]
where role in ('admin', 'manager');

update public.crm_users
set allowed_business_units = array['freight_projects']::text[]
where role = 'seller'
  and (allowed_business_units is null or cardinality(allowed_business_units) = 0);

create index if not exists idx_opportunities_business_unit
  on public.opportunities (business_unit);

create index if not exists idx_opportunities_business_unit_stage
  on public.opportunities (business_unit, stage);

create index if not exists idx_clients_legal_name
  on public.clients (legal_name);

insert into public.clients (legal_name, trade_name)
select distinct client_name, client_name
from public.opportunities
where client_name is not null
  and trim(client_name) <> ''
on conflict (legal_name) do nothing;

update public.opportunities o
set client_id = c.id
from public.clients c
where o.client_id is null
  and (
    c.legal_name = o.client_name
    or c.trade_name = o.client_name
  );

create index if not exists idx_opportunities_client_id
  on public.opportunities (client_id);

alter table public.clients enable row level security;
alter table public.crm_business_units enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_history enable row level security;

drop policy if exists "Allow authenticated read business units" on public.crm_business_units;
drop policy if exists "Allow authenticated read clients" on public.clients;
drop policy if exists "Allow managers insert clients" on public.clients;
drop policy if exists "Allow authenticated insert clients" on public.clients;
drop policy if exists "Allow managers update clients" on public.clients;
drop policy if exists "Allow managers delete clients" on public.clients;

create policy "Allow authenticated read business units"
  on public.crm_business_units
  for select
  to authenticated
  using (true);

create policy "Allow authenticated read clients"
  on public.clients
  for select
  to authenticated
  using (true);

create policy "Allow authenticated insert clients"
  on public.clients
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and u.role in ('admin', 'manager', 'seller')
    )
  );

create policy "Allow managers update clients"
  on public.clients
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and u.role in ('admin', 'manager')
    )
  )
  with check (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and u.role in ('admin', 'manager')
    )
  );

create policy "Allow managers delete clients"
  on public.clients
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and u.role in ('admin', 'manager')
    )
  );

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
        and opportunities.business_unit = any(u.allowed_business_units)
        and (u.role in ('admin', 'manager') or u.seller_name = opportunities.seller)
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
        and opportunities.business_unit = any(u.allowed_business_units)
        and (u.role in ('admin', 'manager') or u.seller_name = opportunities.seller)
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
        and opportunities.business_unit = any(u.allowed_business_units)
        and (u.role in ('admin', 'manager') or u.seller_name = opportunities.seller)
    )
  )
  with check (
    exists (
      select 1
      from public.crm_users u
      where u.id = auth.uid()
        and opportunities.business_unit = any(u.allowed_business_units)
        and (u.role in ('admin', 'manager') or u.seller_name = opportunities.seller)
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
        and u.role in ('admin', 'manager')
        and opportunities.business_unit = any(u.allowed_business_units)
    )
  );

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
        and o.business_unit = any(u.allowed_business_units)
        and (u.role in ('admin', 'manager') or u.seller_name = o.seller)
    )
  );

create policy "Allow authenticated insert opportunity history"
  on public.opportunity_history
  for insert
  to authenticated
  with check (true);

create or replace view public.fact_freight_projects_opportunities
with (security_invoker = true)
as
select
  o.*,
  c.legal_name as client_legal_name,
  c.trade_name as client_trade_name,
  c.tax_id as client_tax_id,
  c.focal_point as client_focal_point,
  c.company_phone as client_company_phone,
  c.contact_email as client_contact_email
from public.opportunities o
left join public.clients c on c.id = o.client_id
where o.business_unit = 'freight_projects';

create or replace view public.fact_maritime_port_opportunities
with (security_invoker = true)
as
select
  o.*,
  c.legal_name as client_legal_name,
  c.trade_name as client_trade_name,
  c.tax_id as client_tax_id,
  c.focal_point as client_focal_point,
  c.company_phone as client_company_phone,
  c.contact_email as client_contact_email
from public.opportunities o
left join public.clients c on c.id = o.client_id
where o.business_unit = 'maritime_port';
