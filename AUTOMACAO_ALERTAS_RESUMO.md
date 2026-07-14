# Automação: alertas e resumo diário

Esta frente pode ser implementada em etapas.

## Alertas de oportunidades paradas

Critério sugerido:

- alerta: oportunidade aberta com mais de 7 dias sem interação;
- crítico: oportunidade aberta com mais de 14 dias sem interação;
- sem ação: oportunidade aberta cujo próximo passo contém `Sem próxima ação`.

Consulta base:

```sql
select
  id,
  client_name,
  opportunity_name,
  seller,
  stage,
  value,
  last_interaction_at,
  current_date - last_interaction_at as days_stalled,
  next_step
from public.opportunities
where stage not in ('Fechado - Ganhou', 'Fechado - Perdido')
  and (
    current_date - last_interaction_at > 7
    or lower(next_step) like '%sem próxima ação%'
  )
order by days_stalled desc;
```

## Resumo diário

Conteúdo sugerido:

- total de oportunidades abertas;
- forecast ponderado;
- oportunidades paradas há mais de 7 dias;
- oportunidades sem próxima ação;
- ranking por vendedor;
- movimentações registradas nas últimas 24h.

## Canais possíveis

- e-mail;
- WhatsApp via API oficial;
- Slack/Teams;
- painel interno no próprio CRM.

## Recomendação

Para começar com baixo custo, primeiro crie uma tela interna de **Alertas** no CRM.
Depois, se fizer sentido, evolua para envio automático diário por e-mail ou WhatsApp.
