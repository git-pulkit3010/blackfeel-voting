import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );

    const accessToken = cookies['access_token'];

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const secretKey = process.env.AUTH_SECRET_KEY || 'your_access_token_secret_here';
    const secret = new TextEncoder().encode(secretKey);

    const { payload } = await jwtVerify(accessToken, secret, {
      algorithms: ['HS256'],
    });

    return NextResponse.json({
      id: payload.sub,
      email: payload.email,
    });
  } catch (error: any) {
    console.error('Auth check failed:', error.message);
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}
