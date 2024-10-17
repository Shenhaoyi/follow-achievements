import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Button } from 'antd';
import { GoogleTagManager } from '@next/third-parties/google';
import Link from 'antd/es/typography/Link';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Follow Achievements',
  description: '自助认证 Follow 订阅源',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AntdRegistry>{children}</AntdRegistry>
        <div style={{ marginTop: '10px', position: 'fixed', top: '10px', right: '10px' }}>
          有问题电报联系我:{' '}
          <Link href="https://t.me/shizhibuyu2024" target="_blank" rel="noopener noreferrer">
            <Button type="primary">Telegram</Button>
          </Link>
        </div>
      </body>
      <GoogleTagManager gtmId="G-9G5BFT0VHL" />
    </html>
  );
}
