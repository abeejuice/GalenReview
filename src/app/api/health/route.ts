import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown'
  
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
    requestId,
  })
}