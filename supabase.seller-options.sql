alter table public.crm_options
  drop constraint if exists crm_options_option_type_check;

alter table public.crm_options
  add constraint crm_options_option_type_check
  check (option_type in ('seller', 'segment', 'service'));

insert into public.crm_options (option_type, name)
values
  ('seller', 'Paulo Penna'),
  ('seller', 'Luiz Garcia'),
  ('seller', 'Leonardo Sgrancio'),
  ('seller', 'Erik de Oliveira'),
  ('seller', 'Mykaela Moreira'),
  ('seller', 'Carlos Cesario')
on conflict (option_type, name) do nothing;
