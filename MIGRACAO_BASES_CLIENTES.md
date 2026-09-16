# Migração: Bases independentes e Clients

Esta evolução muda o CRM para três bases lógicas dentro do mesmo projeto Supabase:

- `clients`: base-mãe de clientes Atlantic.
- `freight_projects`: funil de Freight Forwarder e Projetos.
- `maritime_port`: funil de Serviços Marítimos e Portuários.

Na prática, `clients` funciona como tabela dimensão. As oportunidades são fatos comerciais: cada card registra uma cotação, pedido, negociação ou oportunidade vinculada a um cliente por `client_id`.

Para consulta gerencial, a migração também cria duas views de fato:

- `fact_freight_projects_opportunities`
- `fact_maritime_port_opportunities`

Essas views leem a tabela de oportunidades filtrada por base operacional e já trazem campos-chave da dimensão `clients`.

Os indicadores do dashboard passam a ser calculados somente sobre a base operacional selecionada no cabeçalho. Assim, win rate, loss rate, forecast, conversão, paradas, rankings e receita não se misturam entre Freight/Projetos e Marítimo/Portuário.

## 1. Rodar SQL no Supabase

No Supabase, abra `SQL Editor`, cole todo o conteúdo de `supabase.business-units-clients.sql` e execute.

Esse script cria:

- Tabela `clients`.
- Tabela `crm_business_units`.
- Campo `business_unit` em `opportunities`.
- Campo `client_id` em `opportunities`, vinculado à dimensão `clients`.
- Campos `next_action_date` e `loss_reason` em `opportunities`.
- Segmentos oficiais fixos: `Serviços Portuários`, `Serviços Marítimos`, `Freight Forwarder` e `Projetos`.
- Serviços vinculados ao respectivo segmento em `crm_options`.
- Campo `allowed_business_units` em `crm_users`.
- Políticas RLS para respeitar permissões por base.
- Carga inicial dos clientes já existentes na tabela `opportunities`.
- Preenchimento automático de `client_id` nas oportunidades antigas por correspondência com `client_name`.
- Views de fato para consulta separada de Freight/Projetos e Marítimo/Portuário.
- Preservação do segmento antigo em `original_segment` antes da padronização.

## 2. Configurar acesso dos usuários

Administrador ou gestor com acesso às duas bases:

```sql
update public.crm_users
set role = 'manager',
    allowed_business_units = array['freight_projects', 'maritime_port']::text[]
where email = 'email@empresa.com';
```

Vendedor somente Freight Forwarder e Projetos:

```sql
update public.crm_users
set role = 'seller',
    allowed_business_units = array['freight_projects']::text[]
where email = 'email@empresa.com';
```

Vendedor somente Serviços Marítimos e Portuários:

```sql
update public.crm_users
set role = 'seller',
    allowed_business_units = array['maritime_port']::text[]
where email = 'email@empresa.com';
```

Administrador:

```sql
update public.crm_users
set role = 'admin',
    allowed_business_units = array['freight_projects', 'maritime_port']::text[]
where email = 'email@empresa.com';
```

## 3. Fluxo correto de cadastro

1. Cadastre ou selecione o cliente na base `Clients`.
2. Escolha a base operacional no cabeçalho do CRM.
3. Clique em `Nova oportunidade`.
4. Selecione o cliente na lista suspensa.
5. Preencha segmento, serviço, vendedor, valor e etapa.

Cada nova oportunidade passa a gravar o cliente selecionado como `client_id`, mantendo `client_name` apenas como leitura amigável. Isso permite comparar fatos por cliente, mês, executivo, segmento e serviço sem duplicar o cadastro mestre.

Se o cliente ainda não existir, use `Adicionar` no campo Cliente. O app grava esse cliente em `public.clients` e ele passa a aparecer como opção para novas oportunidades.

A tabela `clients` atende às duas bases operacionais. Ela não pertence exclusivamente a Freight/Projetos nem a Marítimo/Portuário; ela é o cadastro central de empresas Atlantic usado antes de qualquer nova oportunidade.

Campos previstos na base `clients`:

- Razão social
- Nome fantasia
- CNPJ
- Ponto focal
- Telefone
- E-mail
- Endereço
- CEP
- Cidade
- Estado
- País
- Observações

No app, ao cadastrar um novo cliente pelo formulário da oportunidade, `Ponto focal`, `Telefone` e `E-mail` são obrigatórios.

O campo `Segmento` é fixo e possui apenas quatro opções. O campo `Serviço` é editável por segmento: ao selecionar um segmento, o CRM mostra somente os serviços daquele grupo e permite incluir novos serviços para aquele segmento.

## 4. Regra de download CSV

O botão `Exportar CSV` fica visível apenas para usuários `admin` ou `manager`. Vendedores continuam usando o CRM conforme sua base e vendedor, mas não baixam a base.

## 5. Regras comerciais novas

- Cards abertos exigem `Próximo passo` e `Data da próxima ação`.
- Ao mover para `Fechado - Perdido`, o CRM exige um motivo estruturado de perda.
- O dashboard mensal permite filtrar por mês e mostra ganhos, perdas, win rate mensal, ranking por vendedor, motivos de perda e pipeline aberto por etapa.
- Cards em `Fechado - Ganhou` e `Fechado - Perdido` deixam de exibir alertas de atraso, não são arrastáveis e aparecem no Kanban apenas quando pertencem ao mês selecionado.
