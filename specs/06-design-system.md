# 06 · Design system Decoding (front-end)

> Fonte oficial: https://design-system-decoding.vercel.app/ (Decoding Hub · "IA First. Human Driven.")
> Consultar as páginas para detalhes visuais: /cores, /tipografia, /espacamento, /logo, /componentes/*, /icones, /movimento, /tom-de-voz, /tokens.
> **Este arquivo prevalece sobre a seção 10 do prompt original** quando houver diferença (o DS é mais detalhado).

## Tokens CSS (copiar para `client/src/theme/tokens.css`)
```css
:root {
  /* Base */
  --code-blue: #0B1B56;   /* inteligência, IA — âncora e textos */
  --insight:   #77C6F9;   /* clareza — acento predominante */
  --pulse-lime:#E4FD98;   /* energia humana — acento secundário e assinatura */
  --canvas:    #FFFFFF;
  --surface:   #F8F9FE;
  --root:      #111111;

  /* Tints */
  --code-blue-50:#F0F3FD; --code-blue-100:#E0E5FA; --code-blue-200:#BAC6F2; --code-blue-300:#8AA0E8;
  --insight-50:#EDF8FE;   --insight-100:#D8F0FD;   --insight-500:#77C6F9;
  --lime-50:#FAFFF0;      --lime-500:#E4FD98;      --lime-900:#8CB800;

  /* Semânticas (só feedback de estado, sempre com ícone + texto) */
  --success:#22C55E; --warning:#F59E0B; --error:#EF4444; --info:#77C6F9;

  /* Sombras */
  --shadow-sm:0 1px 3px rgba(11,27,86,.08);
  --shadow-md:0 4px 16px rgba(11,27,86,.12);
  --shadow-lg:0 10px 32px rgba(11,27,86,.16);

  /* Raios */
  --radius-sm:4px; --radius-md:8px; --radius-lg:12px; --radius-xl:16px;
  --radius-2xl:24px; --radius-3xl:32px; --radius-full:9999px;

  /* Espaçamento (grid de 8px; 4px só para ajustes internos) */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:20px; --space-6:24px;
  --space-8:32px; --space-10:40px; --space-12:48px; --space-16:64px; --space-20:80px; --space-24:96px;

  /* Movimento */
  --transition-fast:150ms; --transition-normal:250ms; --transition-slow:400ms;
}
```
Espelhar esses tokens no `tailwind.config.js` (`theme.extend.colors/boxShadow/borderRadius/spacing`) para usar classes como `bg-code-blue`, `text-insight`, `shadow-md`, `rounded-xl`.

## Gradientes oficiais (usar com moderação)
- **Mesh Escuro** (hero/cabeçalho escuro): `radial-gradient(ellipse at 20% 50%, rgba(119,198,249,.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(228,253,152,.2) 0%, transparent 50%), linear-gradient(135deg,#0B1B56 0%,#1A2B8A 50%,#0B1B56 100%)`
- **Insight → Lime**: `linear-gradient(135deg,#77C6F9 0%,#E4FD98 100%)`
- **Azul Profundo**: `linear-gradient(135deg,#0B1B56 0%,#3552C8 50%,#77C6F9 100%)`
- **Hero Claro**: `linear-gradient(135deg,#77C6F9 10%,#a8e0f9 40%,#c8f0a0 70%,#E4FD98 100%)`

## Regras de cor
- Balanço cromático: **60% Insight · 40% Lime** (cyan predomina).
- Fundo claro: texto Code Blue, ícones Insight, logo "on light", símbolo azul.
- Fundo escuro: texto branco, ícones Lime ou Insight, logo "on dark", símbolo branco ou lime.
- Cores semânticas só para estado, nunca decorativas.

## Tipografia
| Papel | Tamanho | Peso · Família |
|---|---|---|
| Display / H1 | 48px | 700 · Aileron |
| H2 | 36px | 700 · Aileron |
| H3 / Subtítulo | 24px | 300 · Just Sans |
| H4 | 20px | 300 · Just Sans |
| Body Large | 18px | 400 · Aileron |
| Body | 16px | 400 · Aileron |
| Body Small | 14px | 400 · Aileron |
| Label / Caption | 12px | 600 · Aileron |
| Tiny | 10px | 600 · Aileron |

- Stack: `font-family: Aileron, Inter, system-ui, sans-serif` (títulos/corpo) e `"Just Sans", Inter, system-ui, sans-serif` (H3/H4).
- **Arquivos de fonte já baixados do DS em `assets/fonts/`** (Aileron Light/Regular/SemiBold/Bold, JUST Sans ExLight/Regular). Na Fase 3, copiar para `client/public/fonts/` e declarar:
```css
@font-face{font-family:"Aileron";src:url(/fonts/Aileron-Light.otf) format("opentype");font-weight:300;font-display:swap}
@font-face{font-family:"Aileron";src:url(/fonts/Aileron-Regular.otf) format("opentype");font-weight:400;font-display:swap}
@font-face{font-family:"Aileron";src:url(/fonts/Aileron-SemiBold.otf) format("opentype");font-weight:600;font-display:swap}
@font-face{font-family:"Aileron";src:url(/fonts/Aileron-Bold.otf) format("opentype");font-weight:700;font-display:swap}
@font-face{font-family:"Just Sans";src:url(/fonts/JustSans-ExLight.ttf) format("truetype");font-weight:300;font-display:swap}
@font-face{font-family:"Just Sans";src:url(/fonts/JustSans-Regular.otf) format("opentype");font-weight:400;font-display:swap}
```
- Inter fica só como fallback na pilha.
- **Labels, itens de navegação e categorias: `uppercase` + `letter-spacing: 0.2em`.**

## Componentes do DS → uso no app
| Componente DS | Variantes | Onde usar |
|---|---|---|
| Button | primary, secondary, accent (lime), ghost, destructive · sm/md/lg · disabled = opacity 50% | CTAs (Começar, Próximo, Voltar, Importar, Excluir) |
| Card | básico, com gradiente (faixa no topo), composto (título + badge + meta + ação) | etapas do questionário, devolutiva, KPIs, empresas |
| Input / Select / Textarea | — | login, identificação, colar CSV, nome da turma |
| Badge | default, informação, aprovado, pendente, erro, destaque | status do participante (concluído / em andamento / pendente), nível |
| Alert | feedback | erros de importação por linha, aviso de consistência, preenchimento incompleto |
| Tag | chips e filtros | filtros por área, nível e dimensão |
| Progress | barras de progresso | barra do questionário, cobertura |
| Avatar | 4 tamanhos, 4 tons, iniciais, empilhamento | listas de participantes e turmas |

Criar em `client/src/components/ui/` com a mesma API do DS (ex.: `<Button variant="accent" size="lg">`).

## Ícones
- Fonte: https://design-system-decoding.vercel.app/icones.
- **Interface (botões, estados, navegação): Tabler Icons** (`@tabler/icons-react`), `stroke={1.5}` — no app, sempre via `components/ui/Icon.jsx` (decorativo, `aria-hidden`).
- **Identidade (símbolo, logo, splash): PNGs lineares da marca** — nunca emojis como ícone.
- Cor: Code Blue ou Insight no fundo claro; Lime só no fundo escuro (Code Blue ou Root); nunca Insight sobre insight-50/100/200.

## Gráficos
Radar, barras por nível, cobertura e barras por área com Code Blue (linha/contorno), Insight (preenchimento principal) e Lime (destaque). Grade e eixos em Code Blue tints (100/200).

## Logo e rodapé
- **Logos e símbolos já baixados do DS em `assets/brand/`** (copiar para `client/public/brand/` na Fase 3):
  - `logos/logo-on-light.png` → header/rodapé em fundo claro (admin, devolutiva, PDF)
  - `logos/logo-on-dark.png` → fundos escuros (hero com Mesh Escuro, login)
  - `logos/logo-gradient.png`, `logos/logo-insight.png`, `logos/logo-white-faint.png` → variações
  - `symbols/symbol-blue|lime|white.png`, `badge-blue|lime.png` → favicon e marcas pequenas
- Os PNGs são enormes (até 8571 px de largura): gerar versões redimensionadas (~600 px) ou exibir com `height` fixo. SVG oficial ainda não disponível no DS.
- Rodapé e abertura com a assinatura **IA First. Human Driven.**

## Tom de voz
Claro · ousado · empático · estratégico.
- Vocabulário preferido: **decodificar** (em vez de analisar), **potencial**, **time** (em vez de funcionários), **insight**, **IA First**, **estratégico**.
- Erros explicam o que houve e o que fazer ("Algo deu errado. Verifique sua conexão e tente novamente.").
- CTAs diretos com a voz da marca (ex.: "Decodifique seu potencial em IA — comece agora").
- ⚠️ O exemplo de sucesso do DS menciona "relatório enviado para o e-mail": **não usar neste app**, porque aqui nada é enviado por e-mail (RNF-05). Use "Feito! Sua devolutiva está pronta para baixar."
