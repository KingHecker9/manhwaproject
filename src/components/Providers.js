'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { ThemeProvider } from './ThemeProvider';

export default function Providers({ children }) {
  return (
    <Auth0Provider>
      <ThemeProvider>{children}</ThemeProvider>
    </Auth0Provider>
  );
}
