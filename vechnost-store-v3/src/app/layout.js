import '@/styles/globals.css';
import Providers from './providers';

export const metadata = {
  title: {
    default: 'VECHNOST',
    template: '%s | VECHNOST',
  },
  description: 'Top Up & Digital Products',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
