import { NextRequest, NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'
import { supabaseAdmin } from '@/lib/supabase'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 7)

export async function POST(request: NextRequest) {
  const { url } = await request.json()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  const shortCode = nanoid()

  const { data, error } = await supabaseAdmin
    .from('urls')
    .insert({ short_code: shortCode, original_url: url })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create short URL' }, { status: 500 })
  }

  const baseUrl = request.nextUrl.origin
  return NextResponse.json({
    id: data.id,
    shortCode: data.short_code,
    shortUrl: `${baseUrl}/${data.short_code}`,
    originalUrl: data.original_url,
    createdAt: data.created_at,
  }, { status: 201 })
}
