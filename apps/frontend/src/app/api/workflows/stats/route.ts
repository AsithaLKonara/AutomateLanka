/**
 * Workflow Stats API Route
 */

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/workflows/stats`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

