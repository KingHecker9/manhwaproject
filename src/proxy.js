import { NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function proxy(request) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};