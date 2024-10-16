import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await sql`SELECT * FROM rss_files WHERE filename = ${filename as string}`;
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      const file = result.rows[0];
      res.setHeader('Content-Type', 'application/xml');
      res.status(200).send(file.content);
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ error: 'An error occurred while fetching the file' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
