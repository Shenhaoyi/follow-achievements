import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { hash, filename } = await request.json();

    await sql`
      INSERT INTO hash_records (hash, filename)
      VALUES (${hash}, ${filename})
      ON CONFLICT (hash) DO NOTHING
    `;

    return NextResponse.json({ message: 'Hash added successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error adding hash:', error);
    return NextResponse.json({ error: 'Failed to add hash' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json({ error: 'Hash parameter is required' }, { status: 400 });
    }

    const result = await sql`
      SELECT * FROM hash_records
      WHERE hash = ${hash}
    `;

    return NextResponse.json({ exists: result.rows.length > 0, filename: result.rows[0]?.filename }, { status: 200 });
  } catch (error) {
    console.error('Error checking hash:', error);
    return NextResponse.json({ error: 'Failed to check hash' }, { status: 500 });
  }
}
