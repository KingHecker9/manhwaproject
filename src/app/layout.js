import './globals.css';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}