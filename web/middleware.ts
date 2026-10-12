import {type NextRequest, NextResponse} from 'next/server'
import {updateSession} from './lib/supabase/middleware'

const CANONICAL_HOST = 'grantquest.tech'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = url.hostname

  // Redirect www -> apex (canonical host)
  if (hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST
    return NextResponse.redirect(url, 301)
  }

  // Redirect trailing slash (except root) -> no trailing slash
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1)
    return NextResponse.redirect(url, 301)
  }

  // Continue with Supabase session update
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images:
     * - _next/static, _next/image
     * - favicon.ico, svg/png/jpg/webp assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
