'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Card, Layout, Spin } from 'antd';

const { Title } = Typography;
const { Header, Content } = Layout;

const myHash = '0xf2645bdfd2fee181e794243f586df0b95e8c0752';

const defaultContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Your RSS Feed Title</title>
    <link>https://your-website.com</link>
    <description>
      <!--2、 描述-->
    </description>
    <item>
      <title>Example Item</title>
      <link>https://your-website.com/example-item</link>
      <description>
        <!--1、内容-->
      </description>
      <pubDate>Mon, 06 Sep 2021 12:00:00 GMT</pubDate>
    </item>
    <!--3、RSS 标签-->
  </channel>
</rss>
`;

const verifyRSS3Hash = async (hash: string) => {
  const response = await fetch(`https://scan.rss3.io/api/v2/transactions/${hash}`);
  if (response.ok) {
    const { token_transfers, decoded_input } = await response.json();
    const varified1 = token_transfers.some((item: { to: { hash: string } }) => {
      return item.to.hash.toLocaleLowerCase() === myHash;
    });
    const varified2 = decoded_input.parameters.some((item: { value: string }) => {
      return item.value.toLocaleLowerCase() === myHash;
    });
    return varified1 || varified2;
  }
  return false;
};

function generateRandomFilename() {
  return `rss_feed_${Math.random().toString(36).substring(2, 15)}.xml`;
}

export default function UploadRSS() {
  const [form] = Form.useForm();
  const [hashInput, setHashInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addHashValue = async (hash: string, filename: string) => {
    try {
      const response = await fetch('/api/hash-values', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash, filename }),
      });

      if (response.ok) {
        message.success('Hash added successfully');
        setHashInput(''); // 清空输入
      } else {
        throw new Error('已经校验过');
      }
    } catch (error) {
      console.error('Error adding hash:', error);
      message.error('Failed to add hash');
    }
  };

  const verifyHash = async () => {
    if (!hashInput.trim()) {
      message.error('Please enter a hash value');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/hash-values?hash=${hashInput}`);
      if (response.ok) {
        const { exists, filename } = await response.json();
        if (exists) {
          message.info('已经认证过，为您跳转到对应的文件');
          window.location.href = `/${filename}`;
        } else {
          // 添加到数据
          const result = await verifyRSS3Hash(hashInput);
          if (result) {
            message.success('校验已通过，马上跳转自助认证页面');
            const filename = generateRandomFilename();
            await addHashValue(hashInput, filename);
            await createDefaultFile(filename);
            window.location.href = `/${filename}`;
          } else {
            message.error('校验失败，这不是与我的交易');
          }
        }
      } else {
        throw new Error('Failed to verify hash');
      }
    } catch (error) {
      console.error('Error verifying hash:', error);
      message.error('Failed to verify hash');
    } finally {
      setLoading(false);
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

      message.success(`已创建默认文件: ${filename}`);
    } catch (err) {
      console.error(err);
      message.error('创建默认文件时发生错误');
    }
  };

  return (
    <Spin spinning={loading} tip="Loading...">
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Title level={3} style={{ margin: '16px 0' }}>
            自助认证 Follow 订阅源，获取 100 power
          </Title>
        </Header>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Card style={{ maxWidth: 800, margin: '0 auto' }}>
            <Form form={form} onFinish={verifyHash} layout="vertical">
              <Title level={4}>
                第一步：请先点击下方按钮给我奖励 20 power（订阅下我的列表，订阅完取消订阅即可），感谢！
              </Title>
              <Form.Item>
                <Button
                  type="primary"
                  block
                  onClick={() => {
                    window.open('https://app.follow.is/list/69441049205148672', '_blank');
                  }}
                >
                  给我奖励 power
                </Button>
              </Form.Item>

              <Title level={4}>
                第二步：复制订阅时扣除 power 的交易哈希值（ 见 power
                页面的【交易记录】中最后一列）到下方输入框，点击验证
              </Title>
              <Form.Item label="交易哈希值">
                <Input
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Enter hash value to verify"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={verifyHash} block>
                  验证
                </Button>
              </Form.Item>
            </Form>
            <Title level={4}>第三步：验证完成，则进入认证环节</Title>
          </Card>
        </Content>
      </Layout>
    </Spin>
  );
}
