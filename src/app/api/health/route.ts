import { NextResponse } from 'next/server';
import { APP_VERSION } from '@/lib/config/version';

/** Liveness probe for the reverse proxy / process manager. */
export const dynamic = 'force-dynamic';

export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok', version: APP_VERSION });
}
