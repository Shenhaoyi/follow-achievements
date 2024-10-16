'use client';

import { useState, FormEvent } from 'react';
import Head from 'next/head';

const defaultContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Your RSS Feed Title</title>
    <link>https://your-website.com</link>
    <description>Your RSS Feed Description</description>
    <item>
      <title>Example Item</title>
      <link>https://your-website.com/example-item</link>
      <description>This is an example item in your RSS feed.</description>
      <pubDate>Mon, 06 Sep 2021 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

export default function UploadRSS() {
  const [filename, setFilename] = useState<string>('');
  const [content, setContent] = useState<string>(defaultContent);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/upload-rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, content }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`File uploaded successfully. Access URL: ${data.url}`);
        setFilename('');
        setContent('');
      } else {
        setError(data.error || 'An error occurred while uploading the file');
      }
    } catch (error) {
      setError('An error occurred while uploading the file');
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Upload RSS Feed</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-3xl font-bold mb-6">Upload RSS Feed</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="filename" className="block mb-1">
            Filename:
          </label>
          <input
            type="text"
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-1">
            XML Content:
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Upload RSS Feed
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
