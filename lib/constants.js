// src/lib/constants.js
export const C = {
  ruby: '#B8292F', rubyDeep: '#7D1A1D', rubyLight: '#D44',
  blush: '#FAF0F0', cream: '#FDF9F6', parchment: '#F8F3EE',
  gold: '#B8862A', goldLight: '#F0D688', goldPale: '#FDF8EC',
  sage: '#5E8C61', sagePale: '#EEF5EE',
  slate: '#2A2A35', muted: '#7A6E6E', faint: '#EEE4E4',
  indigo: '#5C6BC0', indigoPale: '#EEF0FA',
  teal: '#27AE8F', tealPale: '#E4F5F0',
  lavender: '#9B7EC8', lavPale: '#F3EEF9',
  white: '#FFFFFF',
};

export const F = { xs: 13, sm: 15, md: 17, lg: 19, xl: 23, xxl: 30, hero: 38 };

export const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap";

export const CREDIT_VALUE_CAD = 20; // 1 credit = $20

export const CREDIT_PACKS = [
  { id: 'p1', credits: 5,  price: 100, label: 'Starter',   desc: 'Try a programme or 2 experiences', popular: false },
  { id: 'p2', credits: 10, price: 180, label: 'Monthly',   desc: 'Full month of sessions & content',  popular: true  },
  { id: 'p3', credits: 20, price: 320, label: 'Quarterly', desc: 'Best value — 3 months',             popular: false },
];
