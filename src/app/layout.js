import '@/styles/globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from './providers';

export const metadata = {
  title: { default: process.env.NEXT_PUBLIC_STORE_NAME || 'VECHNOST', template: '%s | VECHNOST' },
  description: process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Top Up & Digital Products',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="id">
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
