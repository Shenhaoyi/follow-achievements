'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, message, Layout, Space, Card } from 'antd';
import { CloudUploadOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Link, Text } = Typography;
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
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    let storedFilename = localStorage.getItem('rssFilename');
    if (!storedFilename) {
      storedFilename = generateRandomFilename();
      localStorage.setItem('rssFilename', storedFilename);
    }
    const url = `${window.location.origin}/api/rss/${storedFilename}`;
    setFileUrl(url);
    form.setFieldsValue({ content: defaultContent });
    checkFileExistence(storedFilename);
  }, [form]);

  const checkFileExistence = async (filename: string) => {
    try {
      const response = await fetch(`/api/rss/${filename}`);
      if (response.ok) {
        const fileContent = await response.text();
        form.setFieldsValue({ content: fileContent });
        messageApi.success(`已加载现有文件: ${filename}`);
      } else if (response.status === 404) {
        await createDefaultFile(filename);
      } else {
        throw new Error('检查文件存在性失败');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('检查文件时发生错误');
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
        throw new Error('创建默认文件失败');
      }

      messageApi.success(`已创建默认文件: ${filename}`);
    } catch (err) {
      console.error(err);
      messageApi.error('创建默认文件时发生错误');
    }
  };

  const handleSubmit = async (values: { content: string }) => {
    try {
      const filename = fileUrl.split('/').pop() || '';
      const response = await fetch('/api/upload-rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, content: values.content }),
      });

      const data = await response.json();

      if (response.ok) {
        messageApi.success(`文件更新成功。访问地址: ${data.url}`);
      } else {
        throw new Error(data.error || '更新文件时发生错误');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('更新文件时发生错误');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileUrl).then(
      () => {
        messageApi.success('文件 URL 已复制到剪贴板');
      },
      (err) => {
        console.error('无法复制文本: ', err);
        messageApi.error('复制 URL 失败');
      },
    );
  };

  const regenerateFile = async () => {
    try {
      // Delete the old file
      const oldFilename = fileUrl.split('/').pop() || '';
      await fetch(`/api/rss/${oldFilename}`, { method: 'DELETE' });

      // Generate new file
      const newFilename = generateRandomFilename();
      localStorage.setItem('rssFilename', newFilename);
      const newUrl = `${window.location.origin}/api/rss/${newFilename}`;
      setFileUrl(newUrl);
      form.setFieldsValue({ content: defaultContent });

      await createDefaultFile(newFilename);
      messageApi.success('文件重新生成成功');
    } catch (err) {
      console.error(err);
      messageApi.error('重新生成文件时发生错误');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Header style={{ background: '#fff', padding: '0 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Title level={2} style={{ margin: '16px 0' }}>
          编辑 RSS Feed
        </Title>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item label="XML 文件网址">
              <Input.Group compact>
                <Input style={{ width: 'calc(100% - 200px)' }} value={fileUrl} readOnly />
                <Button type="primary" icon={<CopyOutlined />} onClick={copyToClipboard}>
                  复制网址
                </Button>
              </Input.Group>
            </Form.Item>
            <Form.Item>
              <Button icon={<ReloadOutlined />} onClick={regenerateFile} type="dashed" block>
                重新生成文件
              </Button>
            </Form.Item>
            <Form.Item name="content" label="XML 文件内容" rules={[{ required: true, message: '请输入 XML 内容！' }]}>
              <Input.TextArea rows={20} style={{ fontFamily: 'monospace' }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<CloudUploadOutlined />} block>
                更新文件
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
