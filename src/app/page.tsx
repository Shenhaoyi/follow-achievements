'use client';

import React, { useEffect } from 'react';
import { Form, Input, Button, Typography, message, Layout } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Header, Content } = Layout;

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
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    let storedFilename = localStorage.getItem('rssFilename');
    if (!storedFilename) {
      storedFilename = generateRandomFilename();
      localStorage.setItem('rssFilename', storedFilename);
    }
    form.setFieldsValue({ filename: storedFilename, content: defaultContent });
    checkFileExistence(storedFilename);
  }, [form]);

  const checkFileExistence = async (filename: string) => {
    try {
      const response = await fetch(`/api/rss/${filename}`);
      if (response.ok) {
        const fileContent = await response.text();
        form.setFieldsValue({ content: fileContent });
        messageApi.success(`Existing file loaded: ${filename}`);
      } else if (response.status === 404) {
        await createDefaultFile(filename);
      } else {
        throw new Error('Failed to check file existence');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('An error occurred while checking the file');
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

      messageApi.success(`Default file created: ${filename}`);
    } catch (err) {
      console.error(err);
      messageApi.error('An error occurred while creating the default file');
    }
  };

  const handleSubmit = async (values: { filename: string; content: string }) => {
    try {
      const response = await fetch('/api/upload-rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        messageApi.success(`File updated successfully. Access URL: ${data.url}`);
      } else {
        throw new Error(data.error || 'An error occurred while updating the file');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('An error occurred while updating the file');
    }
  };

  return (
    <Layout>
      {contextHolder}
      <Header style={{ background: '#fff', padding: '0 20px' }}>
        <Title level={2}>Edit RSS Feed</Title>
      </Header>
      <Content style={{ padding: '20px' }}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="filename"
            label="Filename"
            rules={[{ required: true, message: 'Please input the filename!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="XML Content"
            rules={[{ required: true, message: 'Please input the XML content!' }]}
          >
            <Input.TextArea rows={20} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<CloudUploadOutlined />}>
              Update RSS Feed
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}
