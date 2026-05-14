import './globals.css';
import Providers from '../lib/providers';

export const metadata = {
  title: 'Her Ruby',
  description: 'Midlife vitality platform for women 40+',
};

export const viewport = {
  themeColor: '#7D1A1D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div style={{ width:'100%', maxWidth:430, minHeight:'100vh', margin:'0 auto', background:'#FDF9F6', position:'relative' }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
