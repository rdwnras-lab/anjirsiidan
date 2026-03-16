import '@/styles/globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import SessionWrapper from '@/components/SessionWrapper';

export const metadata = {
  title: 'Vechnost Store',
  description: 'Platform digital products',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <SessionWrapper>
          <ThemeProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
