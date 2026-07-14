# Migração: Segmento e Serviço

Esta evolução adiciona:

- campo `segment` na tabela `opportunities`;
- campo `service` na tabela `opportunities`;
- tabela `crm_options` para listas suspensas editáveis;
- filtros de Segmento e Serviço no CRM;
- opção de adicionar novos Segmentos e Serviços pelo formulário do app.

## Como aplicar no Supabase

1. Abra o Supabase.
2. Entre no projeto do CRM.
3. Vá em **SQL Editor**.
4. Clique em **New query**.
5. Copie todo o conteúdo do arquivo `supabase.segment-service-options.sql`.
6. Cole no editor.
7. Clique em **Run**.

Depois disso, envie os arquivos atualizados para o GitHub. A Vercel fará o novo deploy automaticamente.

## Como usar no CRM

No cadastro ou edição de oportunidade:

1. Escolha um **Segmento**.
2. Escolha um **Serviço**.
3. Se o item desejado não existir, clique em **Adicionar** ao lado do campo.
4. Digite o novo valor e clique em **Incluir**.

O novo item será salvo no Supabase e ficará disponível para todos os usuários.
