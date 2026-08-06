import { NextResponse } from 'next/server';
import { auth0 } from '../../../../lib/auth0';
import { isAuthor } from '../../../../lib/auth0-roles';

export async function GET() {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ isAuthor: false });
  }

  const authorized = await isAuthor(session.user.sub);
  return NextResponse.json({ isAuthor: authorized });
}