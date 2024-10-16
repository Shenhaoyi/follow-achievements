import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request, { params }: { params: { filename: string } }) {
  const filename = params.filename;

  try {
    const result = await sql`SELECT * FROM rss_files WHERE filename = ${filename}`;
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = result.rows[0];
    return new NextResponse(file.content, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the file' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { filename: string } }) {
  const filename = params.filename;

  try {
    const result = await sql`DELETE FROM rss_files WHERE filename = ${filename}`;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the file' }, { status: 500 });
  }
}
