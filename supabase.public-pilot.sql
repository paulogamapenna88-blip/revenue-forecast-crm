drop policy if exists "Allow anon read pilot" on public.opportunities;
drop policy if exists "Allow anon insert pilot" on public.opportunities;
drop policy if exists "Allow anon update pilot" on public.opportunities;
drop policy if exists "Allow anon delete pilot" on public.opportunities;

create policy "Allow anon read pilot"
  on public.opportunities
  for select
  to anon
  using (true);

create policy "Allow anon insert pilot"
  on public.opportunities
  for insert
  to anon
  with check (true);

create policy "Allow anon update pilot"
  on public.opportunities
  for update
  to anon
  using (true)
  with check (true);

create policy "Allow anon delete pilot"
  on public.opportunities
  for delete
  to anon
  using (true);
