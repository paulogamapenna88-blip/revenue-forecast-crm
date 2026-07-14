create or replace view public.crm_stalled_opportunities as
select
  id,
  client_name,
  opportunity_name,
  seller,
  segment,
  service,
  stage,
  value,
  probability,
  last_interaction_at,
  current_date - last_interaction_at as days_stalled,
  next_step,
  case
    when lower(next_step) like '%sem próxima ação%' then 'sem_proxima_acao'
    when current_date - last_interaction_at > 14 then 'critico'
    when current_date - last_interaction_at > 7 then 'alerta'
    else 'normal'
  end as alert_status
from public.opportunities
where stage not in ('Fechado - Ganhou', 'Fechado - Perdido')
  and (
    current_date - last_interaction_at > 7
    or lower(next_step) like '%sem próxima ação%'
  );
