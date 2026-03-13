import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip known paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/analytics') ||
    pathname === '/' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const shortCode = pathname.slice(1) // Remove leading /

  if (!shortCode || shortCode.includes('/')) {
    return NextResponse.next()
  }

  // Create Supabase client for middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.next()
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Look up the short code
  const { data: urlData } = await supabase
    .from('urls')
    .select('id, original_url')
    .eq('short_code', shortCode)
    .single()

  if (!urlData) {
    return NextResponse.rewrite(new URL('/not-found', request.url))
  }

  // Record click
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const referer = request.headers.get('referer') || ''

  await supabase.from('clicks').insert({
    url_id: urlData.id,
    ip_address: ip,
    user_agent: userAgent,
    referer: referer,
  })

  // Update click_count by counting total clicks
  const { count } = await supabase
    .from('clicks')
    .select('*', { count: 'exact', head: true })
    .eq('url_id', urlData.id)

  if (count !== null) {
    await supabase
      .from('urls')
      .update({ click_count: count })
      .eq('id', urlData.id)
  }

  return NextResponse.redirect(urlData.original_url, 302)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|analytics).*)'],
}
