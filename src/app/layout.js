import './globals.css';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata = {
  title: 'Lumina — Premium Manhwa & Comics Reader',
  description: 'Read your favorite manhwa & digital comics in high definition with a modern, distraction-free vertical reader.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-indigo-500 selection:text-white antialiased">
        <Auth0Provider>
          <ThemeProvider>{children}</ThemeProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}