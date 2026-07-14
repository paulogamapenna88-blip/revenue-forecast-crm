# Configuração: login, permissões e histórico

Esta evolução adiciona:

- login via Supabase Auth;
- tabela `crm_users` para perfil de acesso;
- gestor vê e edita todas as oportunidades;
- vendedor vê e edita apenas oportunidades em que `seller` = `seller_name`;
- histórico de movimentações em `opportunity_history`;
- exclusão de oportunidade apenas para gestor.

## 1. Aplicar SQL no Supabase

No Supabase, abra **SQL Editor** e execute:

`supabase.auth-history-permissions.sql`

## 2. Criar usuários no Supabase Auth

1. Vá em **Authentication > Users**.
2. Clique em **Add user**.
3. Informe e-mail e senha de cada pessoa.
4. Marque como confirmado, se o Supabase oferecer essa opção.

## 3. Entrar uma vez no CRM

Peça para cada usuário fazer login uma vez no CRM.

Na primeira entrada, o app cria um registro automático em `crm_users` com perfil `seller`.

## 4. Ajustar perfil em `crm_users`

Depois do primeiro login:

1. Vá em **Table Editor > crm_users**.
2. Ajuste:
   - `name`: nome exibido no app;
   - `role`: `manager` ou `seller`;
   - `seller_name`: nome exatamente igual ao vendedor nos cards.

Exemplo:

```text
email: paulo@empresa.com
name: Paulo Penna
role: manager
seller_name: Paulo Penna
```

Para vendedor:

```text
email: vendedor@empresa.com
name: Luiz Garcia
role: seller
seller_name: Luiz Garcia
```

## 5. Regras aplicadas

- `manager`: visualiza, edita e exclui qualquer oportunidade.
- `seller`: visualiza e edita apenas oportunidades atribuídas ao seu `seller_name`.
- movimentações de etapa são registradas com usuário, origem, destino e data/hora.

## 6. Observação importante

O valor de `seller_name` precisa ser idêntico ao nome usado no campo **Vendedor** do card.
