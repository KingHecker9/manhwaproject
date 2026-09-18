import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'Lumina — Premium Manhwa & Comics Reader',
  description: 'Read your favorite manhwa & digital comics in high definition with a modern, distraction-free vertical reader.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" data-theme="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-indigo-500 selection:text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}