import {NextResponse} from 'next/server'
import {createServerClient} from '@supabase/ssr'
import {cookies} from 'next/headers'

/**
 * OAuth callback: exchanges the provider code for a session, then lands on
 * the quest log. Failures return to /login with an error message.
 */
export async function GET(request: Request) {
  const {searchParams, origin} = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/log'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({name, value, options}) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // Called from a Route Handler — the response carries the cookies.
            }
          },
        },
      },
    )
    const {error} = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    )
  }

  return NextResponse.redirect(`${origin}/login?error=no-code`)
}
