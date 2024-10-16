import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  const { filename, content } = await request.json();

  // 简单的XML格式验证
  if (!content.trim().startsWith('<?xml') || !content.includes('<rss')) {
    return NextResponse.json({ error: 'Invalid RSS XML format' }, { status: 400 });
  }

  try {
    // 检查文件名是否唯一
    const existing = await sql`SELECT * FROM rss_files WHERE filename = ${filename}`;
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Filename already exists' }, { status: 400 });
    }

    // 插入新数据
    await sql`
      INSERT INTO rss_files (filename, content)
      VALUES (${filename}, ${content})
    `;

    return NextResponse.json(
      { message: 'RSS file uploaded successfully', url: `/api/rss/${filename}` },
      { status: 200 },
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'An error occurred while uploading the file' }, { status: 500 });
  }
}
