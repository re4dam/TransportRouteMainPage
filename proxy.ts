import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Get the current URL path the user is trying to visit
  const path = request.nextUrl.pathname;

  // 2. Define your protected paths. 
  // Since you made the GET endpoints public in C#, viewing the tables is public.
  // We only want to lock down the creation and editing pages.
  const isProtectedRoute = 
    path.startsWith('/routes/create') || 
    path.startsWith('/routes/edit') ||
    path.startsWith('/categories/create') || 
    path.startsWith('/categories/edit') ||
    path.startsWith('/vehicles/create') || 
    path.startsWith('/vehicles/edit');

  // 3. Look for the HttpOnly cookie we created in C#
  // Next.js Middleware runs on the server, so it CAN safely read incoming cookies!
  const token = request.cookies.get('jwt')?.value;

  // 4. THE BOUNCER: If it's a locked page and they have no token, kick them to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 5. UX BONUS: If they are already logged in, don't let them see the login/register pages
  const isPublicAuthRoute = path === '/login' || path === '/register';
  if (isPublicAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url)); // Send them to the dashboard
  }

  // 6. If they pass the checks, let the request proceed to the page
  return NextResponse.next();
}

// 7. OPTIMIZATION: Tell Next.js exactly which routes this middleware should run on.
// This prevents the middleware from wasting resources checking image files or CSS.
export const config = {
  matcher: [
    '/routes/:path*',
    '/categories/:path*',
    '/vehicles/:path*',
    '/login',
    '/register'
  ],
};