import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { useUser } from '@auth0/nextjs-auth0/client';

export const auth0 = new Auth0Client();