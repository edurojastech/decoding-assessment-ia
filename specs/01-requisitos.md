# 01 · Requisitos — Decoding · Assessment de Maturidade em IA

> Fonte: `Decoding_Assessment_Prompt_Replit.md.pdf` (12 páginas) + slides In Company 5–8.
> Escopo: **somente o Diagnóstico**. As trilhas (básica e avançada) aparecem apenas como texto de recomendação e como oferta associada às turmas.

## Fora do escopo (não implementar)
- Envio automático de e-mail (links são copiados/exportados)
- Cobrança
- Qualquer modelo de IA externo (pontuação 100% determinística)
- Login de empresa cliente / acesso de leitura do cliente

## Requisitos funcionais (RF)

| ID | Requisito | Seção PDF | Critério |
|----|-----------|-----------|----------|
| RF-01 | Admin faz login (senha com bcrypt + sessão/JWT) | 1, 2 | C1 |
| RF-02 | Admin cadastra empresa | 2 | C1 |
| RF-03 | Importar participantes por CSV (upload ou colar texto) com colunas `nome,email,area`; modelo para baixar | 2.1 | C1 |
| RF-04 | Validar por linha (e-mail válido e único na empresa, nome e área preenchidos); importar só válidas; mostrar erros por linha | 2.1 | C1 |
| RF-05 | Gerar token + link pessoal por participante | 2.1, 2.2 | C1 |
| RF-06 | Exportar lista de links (copiar / baixar CSV com nome, e-mail, link) | 2.2 | C1 |
| RF-07 | Lista de participantes com status, filtros por área e nível | 8 | C1 |
| RF-08 | Participante: boas-vindas + aviso LGPD + consentimento; mostrar "9 a 12 minutos" | 2, 11 | C2 |
| RF-09 | Participante confere/corrige identificação pré-preenchida | 2 | C2 |
| RF-10 | Questionário progressivo: 1 dimensão por vez, barra de progresso, voltar; perguntas de perfil P0a–P0c | 2, 4 | C2 |
| RF-11 | Devolutiva individual (7 blocos da seção 6) com radar | 6 | C2 |
| RF-12 | Exportar devolutiva em PDF (no front) com identificação e assinatura; reabrir pelo mesmo link | 6, 13 | C2 |
| RF-13 | Diagnóstico consolidado da empresa (6 blocos da seção 6), sempre como "visão dos respondentes" com cobertura | 6 | C3 |
| RF-14 | Necessidades por área (mapa de calor ou tabela dimensão × área) | 6 | C3 |
| RF-15 | Grupos por maturidade automáticos (contagem + lista por nível) | 7 | C4 |
| RF-16 | Turmas manuais: criar, nomear, editar, mover pessoas; oferta sugerida por nível | 7 | C4 |
| RF-17 | Visão geral de todas as empresas (micro e macro) | 2, 8 | C3 |
| RF-18 | Admin pode excluir participantes e dados da empresa | 11 | C7 |
| RF-19 | Seed: 1 admin demo (credenciais na tela de login), 2 empresas com 15–25 participantes, respostas cobrindo os 4 níveis, links, ≥1 turma | 9 | C6 |

## Regras de negócio (RN)

| ID | Regra | Seção | Critério |
|----|-------|-------|----------|
| RN-01 | 5 dimensões: Familiaridade(4q), Contexto(5q), Aplicação(5q), Revisão(5q), Autonomia(5q) = 24 pontuadas | 3, 4 | C5 |
| RN-02 | Pesos por tipo: autopercepção 1 · conhecimento 1,5 · prática 2 | 3 | C5 |
| RN-03 | `score_dim = soma(pontos*peso) / soma(4*peso) * 100`, só questões respondidas | 4 | C5 |
| RN-04 | Score geral = média simples das dimensões pontuadas | 4 | C5 |
| RN-05 | Níveis: Iniciante 0–25 · Básico 26–50 · Intermediário 51–75 · Avançado 76–100 | 3 | C5 |
| RN-06 | "Não sei"/"não uso" = menor pontuação, sem tom de erro | 3 | C5 |
| RN-07 | Dimensão só pontua com ≥ 60% respondido; senão "dados insuficientes" | 3 | C5 |
| RN-08 | Geral só com ≥ 70% do questionário; senão "preenchimento incompleto" | 3 | C5 |
| RN-09 | Trava: média autopercepção ≥ 75 **e** média prática ≤ 40 → rebaixa nível geral 1 degrau + flag "autopercepção acima da prática" | 3 | C5 |
| RN-10 | Evidências por dimensão: questão de maior pontuação (força) e menor (lacuna); guardar texto da opção | 6 | C2 |
| RN-11 | Recomendação: Iniciante/Básico → "Escale sua produtividade com IA"; Intermediário com lacuna em Aplicação ou Autonomia → "Do Problema ao Plano"; Avançado → "Construa Soluções e Produtos Digitais com IA"; dimensão ≤ 40 → foco curto | 5 | C2 |
| RN-12 | Ferramentas (P0c) nunca pontuam | 4 | C5 |
| RN-13 | Classificação só por nível de maturidade (área/nome só filtram) | 7 | C4 |

## Requisitos não funcionais (RNF)
- RNF-01 Interface 100% pt-BR, tom de desenvolvimento, sem prometer ganho percentual
- RNF-02 Responsivo (celular e desktop), acessível, bom contraste
- RNF-03 Cálculo no backend; nenhuma IA externa
- RNF-04 LGPD: consentimento, coleta mínima, rótulos honestos
- RNF-05 A UI nunca afirma ter enviado e-mail ou feito ação que não fez
- RNF-06 Identidade Decoding conforme design system oficial (https://design-system-decoding.vercel.app/) — ver `06-design-system.md`

## Critérios de aceite (seção 14)
- **C1** Admin cadastra empresa, importa CSV com validação por linha, gera e exporta links
- **C2** Participante abre link, confirma dados, responde, vê devolutiva e baixa PDF; tudo persiste
- **C3** Consolidado com cobertura, distribuição por nível, radar e necessidades por área
- **C4** Agrupamento por nível; turmas criadas/editadas manualmente, pessoas movíveis
- **C5** Pontuação exatamente conforme regras, no backend
- **C6** Seed popula dashboards no primeiro acesso
- **C7** Design Decoding, responsivo, sem afirmar envios

## Pontos em aberto (levar ao cliente)
- Radar do slide 8 em escala 0–5; prompt usa 0–100. Decisão: calcular 0–100; exibição pode dividir por 20.
- Pesos/faixas são de pilotagem — calibrar com grupo pequeno.
