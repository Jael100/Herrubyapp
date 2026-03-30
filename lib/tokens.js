// packages/ui/src/tokens.js
// Single source of truth for Her Ruby brand — used by web, flyer, and app

export const C = {
  ruby:      '#B8292F',
  rubyDeep:  '#7D1A1D',
  rubyMid:   '#9E2226',
  blush:     '#FAF0F0',
  cream:     '#FDF9F6',
  parchment: '#F8F3EE',
  gold:      '#B8862A',
  goldLight: '#F0D688',
  goldPale:  '#FDF8EC',
  sage:      '#5E8C61',
  sagePale:  '#EEF5EE',
  slate:     '#2A2A35',
  muted:     '#7A6E6E',
  faint:     '#EEE4E4',
  indigo:    '#5C6BC0',
  indigoPale:'#EEF0FA',
  teal:      '#27AE8F',
  tealPale:  '#E4F5F0',
  lavender:  '#9B7EC8',
  white:     '#FFFFFF',
};

export const F = {
  xs: 13, sm: 15, md: 17, lg: 19, xl: 23, xxl: 30, hero: 38,
};

export const FONTS = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans:  "'DM Sans', system-ui, sans-serif",
  googleUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap",
};

export const CREDIT_PACKS = [
  { id: 'p1', credits: 5,  price: 100, emoji: '🌸', label: 'Starter',   desc: 'Try a programme or 2 experiences', popular: false },
  { id: 'p2', credits: 10, price: 180, emoji: '💎', label: 'Monthly',   desc: 'Full month of sessions & content',  popular: true  },
  { id: 'p3', credits: 20, price: 320, emoji: '✦',  label: 'Quarterly', desc: 'Best value — 3 months',             popular: false },
];

// CSS custom properties string — inject into :root
export const CSS_VARS = `
  --ruby:       ${C.ruby};
  --ruby-deep:  ${C.rubyDeep};
  --ruby-mid:   ${C.rubyMid};
  --gold:       ${C.gold};
  --gold-lt:    ${C.goldLight};
  --gold-pale:  ${C.goldPale};
  --cream:      ${C.cream};
  --parchment:  ${C.parchment};
  --blush:      ${C.blush};
  --slate:      ${C.slate};
  --muted:      ${C.muted};
  --faint:      ${C.faint};
  --sage:       ${C.sage};
  --sage-pale:  ${C.sagePale};
  --indigo:     ${C.indigo};
  --teal:       ${C.teal};
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans:  'DM Sans', system-ui, sans-serif;
`;
