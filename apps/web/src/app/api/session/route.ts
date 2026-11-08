import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';

export function GET(request: NextRequest) {
  return withAuth(async (auth) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      user: session.user,
      session: session.session,
    });
  });
}
