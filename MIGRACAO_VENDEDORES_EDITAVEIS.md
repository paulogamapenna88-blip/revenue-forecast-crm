# Migração: vendedores editáveis

Esta evolução permite:

- carregar vendedores da tabela `crm_options`;
- adicionar novos vendedores pelo formulário de oportunidade;
- excluir vendedores da lista suspensa;
- refletir a lista atualizada no filtro de vendedores e no cadastro.

## Como aplicar no Supabase

1. Abra o Supabase.
2. Entre no projeto do CRM.
3. Vá em **SQL Editor**.
4. Clique em **New query**.
5. Copie todo o conteúdo do arquivo `supabase.seller-options.sql`.
6. Cole no editor.
7. Clique em **Run**.

## Como usar no CRM

1. Clique em **Nova oportunidade** ou edite uma oportunidade existente.
2. No campo **Vendedor**, use:
   - **Adicionar** para incluir um novo vendedor;
   - **Excluir** para remover o vendedor selecionado da lista.

Importante: excluir um vendedor da lista não apaga cards existentes. Cards antigos continuam preservados com o nome salvo.
