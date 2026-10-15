// Cores do DS para uso em JS (gráficos Recharts nas Fatias B e D). Espelha tokens.css.
export const colors = {
  codeBlue: '#0B1B56',
  insight: '#77C6F9',
  pulseLime: '#E4FD98',
  canvas: '#FFFFFF',
  surface: '#F8F9FE',
  root: '#111111',
  codeBlue50: '#F0F3FD',
  codeBlue100: '#E0E5FA',
  codeBlue200: '#BAC6F2',
  codeBlue300: '#8AA0E8',
  insight50: '#EDF8FE',
  insight100: '#D8F0FD',
  lime50: '#FAFFF0',
  lime900: '#8CB800',
  lime100: '#F5FEDF',
  lime800: '#5B6E00',
  codeBlue700: '#2338A8',
  insight700: '#1A6FA8',
  textSecondary: '#5B78DA',
  textMuted: '#8AA0E8',
};

// Gráficos: contorno Code Blue, preenchimento Insight, destaque Lime, grade em tints.
export const chart = {
  stroke: colors.codeBlue,
  fill: colors.insight,
  highlight: colors.pulseLime,
  grid: colors.codeBlue100,
  axis: colors.codeBlue200,
};
