'use client';

import React from 'react';
import { Button, Typography, Layout, Card } from 'antd';

const { Title, Link } = Typography;
const { Header, Content } = Layout;

export default function UploadRSS() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Title level={2} style={{ margin: '16px 0' }}>
          自助认证 Follow 订阅源，获取 100 power
        </Title>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
          <Link href="https://app.follow.is/list/69441049205148672">
            <Button type="primary" block>
              给我奖励 power
            </Button>
          </Link>
          <Title level={4}>请先点击上方按钮给我奖励 20 power（订阅下我的列表，订阅完取消订阅即可），感谢！</Title>
        </Card>
      </Content>
    </Layout>
  );
}
