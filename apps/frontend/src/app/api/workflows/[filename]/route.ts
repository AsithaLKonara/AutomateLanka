/**
 * Single Workflow API Route
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    const response = await fetch(`${BACKEND_URL}/api/workflows/${filename}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }
      throw new Error('Failed to fetch workflow');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Workflow API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

