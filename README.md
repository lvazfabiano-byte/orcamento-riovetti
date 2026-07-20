# Orçamento Riovetti — app com API própria

## O que tem aqui
- index.html — o app (catálogo, busca, orçamento, botões de IA)
- netlify/functions/interpretar-pedido.mts — lê o texto do cliente e extrai os itens
- netlify/functions/interpretar-planta.mts — lê o PDF da planta e extrai os itens
- netlify.toml — configuração do site

## Como publicar (sem precisar de linha de comando)

1. Crie uma chave de API em https://console.anthropic.com (ou platform.claude.com) → API Keys → Create Key.
   GUARDE essa chave, ela não aparece de novo depois.

2. Acesse https://app.netlify.com/drop

3. Arraste esta pasta inteira (ORCAMENTO_RIOVETTI_APP) para a área de upload.
   O Netlify vai criar o site e te dar um link tipo https://algumnome.netlify.app

4. No painel do site, vá em: Site configuration → Environment variables → Add a variable
   - Key: ANTHROPIC_API_KEY
   - Value: (cole a chave que você criou no passo 1)
   - Salve

5. Vá na aba "Deploys" e clique em "Trigger deploy" → "Deploy site" pra aplicar a variável nova.

6. Pronto — o link do site (passo 3) é o que você compartilha com sua esposa e a colega.
   Não precisa de conta Claude, não precisa estar dentro do Claude — funciona sozinho.

## Importante sobre a chave de API
- A chave fica só no Netlify (nunca no código, nunca aparece pra quem usa o site).
- Cobrança: cada clique em "Interpretar pedido" ou "Analisar planta" consome créditos da sua conta Anthropic (a API é paga por uso). Vale acompanhar o consumo em console.anthropic.com.
- Se quiser trocar a chave depois, é só editar a variável de ambiente no Netlify e fazer "Trigger deploy" de novo.

## Atualizar o catálogo de preços depois
O catálogo está gravado dentro do index.html. Quando a tabela da Riovetti mudar, volte nesta conversa e me mande a planilha nova — eu gero um index.html atualizado pra você repetir o passo 3.
