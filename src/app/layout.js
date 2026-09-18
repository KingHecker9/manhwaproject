import './globals.css';
import Providers from '../components/Providers';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://manhwaproject.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lumina — Premium Manhwa & Digital Comics Reader',
    template: '%s | Lumina Comics',
  },
  description:
    'Experience official and independent digital manhwa & web comics with distraction-free continuous vertical scrolling, real-time release schedules, and creator support.',
  keywords: [
    'manhwa',
    'comics',
    'digital comics',
    'webtoon reader',
    'read manhwa online',
    'action manhwa',
    'fantasy manhwa',
    'high definition reader',
    'lumina comics',
  ],
  authors: [{ name: 'TheRealKCE', url: siteUrl }],
  creator: 'TheRealKCE',
  publisher: 'Lumina Comics',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Lumina — Premium Manhwa & Digital Comics Reader',
    description:
      'Experience official and independent digital manhwa with continuous vertical scrolling, real-time release schedules, and high definition panel rendering.',
    url: siteUrl,
    siteName: 'Lumina Comics',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumina — Premium Manhwa & Digital Comics Reader',
    description: 'Modern, high-definition digital comic reading platform.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lumina Comics',
    url: siteUrl,
    description: 'Premium digital manhwa and comics reading platform.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/#catalog?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="dark" data-theme="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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