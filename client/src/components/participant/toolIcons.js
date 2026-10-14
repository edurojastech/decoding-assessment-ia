import {
  IconBan, IconBrandGoogle, IconBrandOpenai, IconBrandWindows, IconDots, IconNotebook, IconSparkles,
} from '@tabler/icons-react';

// Ícone de cada ferramenta de IA (P0c). Usa os ícones de marca do Tabler quando existem;
// para trocar por logos oficiais, coloque os arquivos em public/tools/ e aponte aqui.
export const TOOL_ICONS = {
  Claude: IconSparkles,
  Gemini: IconBrandGoogle,
  'Microsoft Copilot': IconBrandWindows,
  ChatGPT: IconBrandOpenai,
  NotebookLM: IconNotebook,
  Outra: IconDots,
  Nenhuma: IconBan,
};
