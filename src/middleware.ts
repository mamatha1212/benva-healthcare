import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT. In production, this should be an environment variable.
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');

export async function middleware(request: NextRequest) {
  // Check if the user is trying to access the admin area
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Allow access to the login page itself
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify token
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (err) {
      // Token is invalid or expired
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
