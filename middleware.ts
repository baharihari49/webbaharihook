import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow access to auth pages and API routes
    if (
      req.nextUrl.pathname.startsWith('/auth') ||
      req.nextUrl.pathname.startsWith('/api/auth') ||
      req.nextUrl.pathname.startsWith('/api/w/') || // Public webhook endpoints
      req.nextUrl.pathname === '/' ||
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/favicon')
    ) {
      return NextResponse.next()
    }

    // Redirect to login if not authenticated
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't need authentication
        const publicPaths = [
          '/',
          '/auth/login',
          '/auth/register',
          '/api/auth',
          '/api/w', // Public webhook endpoints
        ]

        const isPublicPath = publicPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        )

        if (isPublicPath) {
          return true
        }

        // Protected routes need authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}