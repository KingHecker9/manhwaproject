'use client';

import { Suspense } from 'react';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { ThemeProvider } from './ThemeProvider';
import NavigationProgressBar from './NavigationProgressBar';

export default function Providers({ children }) {
  return (
    <Auth0Provider>
      <ThemeProvider>
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        {children}
      </ThemeProvider>
    </Auth0Provider>
  );
}
