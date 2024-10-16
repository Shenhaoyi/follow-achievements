import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { filename, content } = req.body;

    // 简单的XML格式验证
    if (!content.trim().startsWith('<?xml') || !content.includes('<rss')) {
      return res.status(400).json({ error: 'Invalid RSS XML format' });
    }

    try {
      // 检查文件名是否唯一
      const existing = await sql`SELECT * FROM rss_files WHERE filename = ${filename}`;
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Filename already exists' });
      }

      // 插入新数据
      await sql`
        INSERT INTO rss_files (filename, content)
        VALUES (${filename}, ${content})
      `;

      res.status(200).json({ message: 'RSS file uploaded successfully', url: `/api/rss/${filename}` });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'An error occurred while uploading the file' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
