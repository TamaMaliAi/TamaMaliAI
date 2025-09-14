// middleware.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'

const jwtSecret = process.env.JWT_SECRET

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('token');
  
  if (!cookie) {
    return NextResponse.redirect(
      new URL('/', request.url)
    );
  }

  try {
    const decoded = jose.decodeJwt(cookie.value);
    
    await jose.jwtVerify(cookie.value, new TextEncoder().encode(jwtSecret));
    const userId = decoded.userId;
    const userRole = decoded.role; // Get role from JWT token
    
    if (!userId) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Role-based access control
    const pathname = request.nextUrl.pathname;
    
    // Teacher-only routes
    if (pathname.startsWith('/teacher-dashboard')) {
      if (userRole !== 'TEACHER') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    
    // Student-only routes
    if (pathname.startsWith('/student-dashboard')) {
      if (userRole !== 'STUDENT') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    
  } catch (error) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/teacher-dashboard/:path*',
    '/student-dashboard/:path*',
    '/dashboard',
    '/quiz/:path*',
    '/profile',
    '/settings'
  ]
}