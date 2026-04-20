import {NextResponse, type NextRequest} from 'next/server';

/**
 * Next.js Middleware for Route Protection.
 * High-performance session validation using Better Auth.
 */
export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // 1. Skip if it's a static asset or internal next.js path
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // 2. Identify Protected Routes
  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/vendor',
    '/create-campaign',
    '/notifications',
    '/wallet',
  ];
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route),
  );
  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/signup');

  // 3. Simple Cookie Check (Fast Pass)
  const sessionCookie = request.cookies.get('better-auth.session_token');
  console.log(sessionCookie, 'settt');
  // If no session cookie and accessing protected route, redirect to /login immediately
  if (!sessionCookie && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  let user: any = null;

  // 4. Verification with Backend (Deep Check)
  if (sessionCookie) {
    try {
      // Use local backend URL if env is not reachable from middleware
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          user = data.user;
        }
      }
    } catch (error) {
      console.error('Middleware Auth Check Error:', error);
      // In case of backend failure, we might want to fail-safe.
      // For now, we continue and let the server components handle it if needed.
    }
  }

  // 5. Final Protection Logic
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (user && isAuthRoute) {
    const roles = user.roles || [];
    const url = request.nextUrl.clone();

    if (roles.includes('admin')) {
      url.pathname = '/admin';
    } else if (roles.includes('vendor') && !roles.includes('user')) {
      url.pathname = '/vendor/dashboard';
    } else {
      url.pathname = '/dashboard';
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
