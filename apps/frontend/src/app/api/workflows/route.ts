/**
 * Workflows API Route
 * Next.js 14 App Router API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const trigger = searchParams.get('trigger') || 'all';
    const complexity = searchParams.get('complexity') || 'all';
    const active_only = searchParams.get('active_only') || 'false';
    const page = searchParams.get('page') || '1';
    const per_page = searchParams.get('per_page') || '20';

    const params = new URLSearchParams({
      q: query,
      trigger,
      complexity,
      active_only,
      page,
      per_page,
    });

    const response = await fetch(`${BACKEND_URL}/api/workflows?${params}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workflows');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Workflows API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

