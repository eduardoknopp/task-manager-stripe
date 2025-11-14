import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/billing', '/tasks', '/projects', '/settings']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect to signin if accessing protected route without session
  if (isProtectedPath && !session) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect to dashboard if accessing auth pages while logged in
  const authPaths = ['/signin', '/signup']
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/billing/:path*', '/tasks/:path*', '/projects/:path*', '/settings/:path*', '/signin', '/signup'],
}
