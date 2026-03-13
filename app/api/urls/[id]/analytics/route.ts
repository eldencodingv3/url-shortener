import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  // Get the URL
  const { data: url, error: urlError } = await supabaseAdmin
    .from('urls')
    .select('*')
    .eq('id', id)
    .single()

  if (urlError || !url) {
    return NextResponse.json({ error: 'URL not found' }, { status: 404 })
  }

  // Get clicks
  const { data: clicks, error: clicksError } = await supabaseAdmin
    .from('clicks')
    .select('*')
    .eq('url_id', id)
    .order('clicked_at', { ascending: false })

  if (clicksError) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }

  return NextResponse.json({
    url,
    clicks,
    totalClicks: clicks.length,
  })
}
