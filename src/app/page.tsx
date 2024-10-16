'use client';

import React, { useState, FormEvent, useEffect } from 'react';

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

function generateRandomFilename() {
  return `rss_feed_${Math.random().toString(36).substring(2, 15)}.xml`;
}

export default function UploadRSS() {
  const [filename, setFilename] = useState<string>('');
  const [content, setContent] = useState<string>(defaultContent);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let storedFilename = localStorage.getItem('rssFilename');
    if (!storedFilename) {
      storedFilename = generateRandomFilename();
      localStorage.setItem('rssFilename', storedFilename);
    }
    setFilename(storedFilename);

    checkFileExistence(storedFilename);
  }, []);

  const checkFileExistence = async (filename: string) => {
    try {
      const response = await fetch(`/api/rss/${filename}`);
      if (response.ok) {
        const fileContent = await response.text();
        setContent(fileContent);
        setMessage(`Existing file loaded: ${filename}`);
      } else if (response.status === 404) {
        await createDefaultFile(filename);
      } else {
        throw new Error('Failed to check file existence');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while checking the file');
    }
  };

  const createDefaultFile = async (filename: string) => {
    try {
      const response = await fetch('/api/upload-rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, content: defaultContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to create default file');
      }

      setMessage(`Default file created: ${filename}`);
    } catch (err) {
      console.error(err);
      setError('An error occurred while creating the default file');
    }
  };

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
        setMessage(`File updated successfully. Access URL: ${data.url}`);
      } else {
        setError(data.error || 'An error occurred while updating the file');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating the file');
    }
  };

  return (
    <div>
      <h1>Edit RSS Feed</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="filename">Filename</label>
          <input
            type="text"
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">XML Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={20}
          />
        </div>
        <button type="submit">Update RSS Feed</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
