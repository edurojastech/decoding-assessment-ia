# Decoding · Assessment de Maturidade em IA

## Executar no Replit

- Use **Run** para iniciar o workflow `Start application`.
- Comando do workflow: `PORT=3000 JWT_SECRET="$SESSION_SECRET" npm run dev`.
- Vite atende em `0.0.0.0:5000` e encaminha `/api` ao Express na porta 3000. O frontend usa URLs relativas.
- O workflow reutiliza o segredo `SESSION_SECRET` já existente para assinar JWTs, sem copiar seu valor para arquivos.
- Sem `DATABASE_URL`, o projeto mantém o SQLite existente em `server/data/dev.sqlite`. Não foi criado ou migrado nenhum banco externo.
- No primeiro início, o seed cria os dados de demonstração automaticamente. Os dados persistem entre reinícios; não apague o arquivo SQLite para reiniciar o servidor.
- A tela `/admin/login` mostra as credenciais de demonstração do próprio projeto.

## Comandos

- `npm test`: testes do servidor.
- `npm run build`: build do frontend.
- `npm start`: Express serve a API e o frontend compilado.
- `npm run seed`: seed idempotente de demonstração.

## Produção

O preview é um ambiente de desenvolvimento, não uma publicação.
Antes de usar dados reais, configure `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` por Secrets, desative a exibição das credenciais com `DEMO_MODE=false` e defina armazenamento durável apropriado.
O administrador é criado apenas quando o banco ainda está vazio; mudar as variáveis de seed não altera a senha de uma conta existente.
Para executar o build em produção, use `NODE_ENV=production` e configure a porta do Express conforme o ambiente.

## Escopo importado

Preserve `client/` e `server/`, a stack existente e as regras de `AGENTS.md`.
As especificações e decisões estão em `specs/`.
O projeto importado implementa a fundação administrativa; questionário, pontuação e relatórios ainda estão pendentes conforme `specs/05-plano.md`.
Vitest foi atualizado para a linha 4 compatível com Node 20 porque a dependência transitiva do runner importado foi bloqueada pelo firewall de pacotes.

## Verificação da configuração

Os 16 testes existentes e o build passaram. A tela de login foi verificada no preview.
Health check, login demo e listagem autenticada das duas empresas foram verificados via API.
A interface após login não foi verificada visualmente.
