'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, message, Layout, Card, Spin, Alert, Divider } from 'antd';
import { CloudUploadOutlined, CopyOutlined, RollbackOutlined } from '@ant-design/icons';
import { defaultContent } from '@/app/constants';

const { Title } = Typography;
const { Header, Content } = Layout;

export default function UploadRSS({ params }: { params: { filename: string } }) {
  const { filename } = params;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = `${window.location.origin}/api/rss/${filename}`;
    setFileUrl(url);
    form.setFieldsValue({ content: '' });
    checkFileExistence(filename);
  }, [form]);

  const checkFileExistence = async (filename: string) => {
    try {
      const response = await fetch(`/api/rss/${filename}`);
      if (response.ok) {
        const fileContent = await response.text();
        form.setFieldsValue({ content: fileContent });
        messageApi.success(`已加载现有文件: ${filename}`);
      } else if (response.status === 404) {
        messageApi.error('文件时不存在');
      } else {
        throw new Error('检查文件存在性失败');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('检查文件时发生错误');
    }
  };

  const handleSubmit = async (values: { content: string }) => {
    try {
      setLoading(true);
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
      messageApi.error((err as Error).message);
    } finally {
      setLoading(false);
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

  const resetFileContent = () => {
    form.setFieldsValue({ content: defaultContent });
  };

  return (
    <Spin spinning={loading} tip="Loading...">
      <Layout style={{ minHeight: '100vh' }}>
        {contextHolder}
        <Header style={{ background: '#fff', padding: '0 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Title level={3} style={{ margin: '16px 0' }}>
            自助认证 Follow 订阅源，获取 100 power
          </Title>
        </Header>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Card style={{ maxWidth: 800, margin: '0 auto' }}>
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Alert
                message="说明：请在 20 分钟内完成认证，否则将无法认证成功，有特殊原因请电报联系我"
                type="warning"
              />
              <Divider />
              <Title level={4}>第一步：复制网址，然后去 Follow 中订阅</Title>
              <Form.Item label="网址">
                <Input.Group compact>
                  <Input style={{ width: 'calc(100% - 200px)' }} value={fileUrl} readOnly />
                  <Button type="primary" icon={<CopyOutlined />} onClick={copyToClipboard}>
                    复制网址
                  </Button>
                </Input.Group>
              </Form.Item>
              <Title level={4}>
                {
                  '第二步：在 Follow 左侧栏中右键点击刚才订阅的源，点击【认证】打开认证弹窗，将相关认证内容复制并粘贴到文件对应位置（三种方式任选其一，例如选择【内容】，则在<!--1、 内容-->这一行的下方粘贴即可），然后点击下方的【更新文件】'
                }
              </Title>
              <Form.Item name="content" label="文件内容" rules={[{ required: true, message: '请输入 XML 内容！' }]}>
                <Input.TextArea rows={22} style={{ fontFamily: 'monospace' }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<CloudUploadOutlined />}>
                  更新文件
                </Button>{' '}
                <Button type="default" icon={<RollbackOutlined />} onClick={resetFileContent}>
                  重置文件内容
                </Button>
              </Form.Item>
              <Title level={4}>第三步：回到 Follow 认证弹窗中，点击完成认证</Title>
              <Title level={4}>第四步：在 Follow 中依次点击【个人头像】-【成就】-【mint】。</Title>
              <Title level={4}>好了， 100 power 到手</Title>
              <Title level={4}>
                <Button type="primary" block onClick={() => (window.location.href = '/')}>
                  再认证一个
                </Button>
              </Title>
            </Form>
          </Card>
        </Content>
      </Layout>
    </Spin>
  );
}
