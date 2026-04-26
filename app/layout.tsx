import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sticky — Korean Email Client Preview",
  description: "HTML 이메일을 입력하면 네이버, Gmail, 다음/카카오 메일에서 어떻게 보이는지 실시간으로 시뮬레이션합니다.",
  metadataBase: new URL('https://sticky-kappa.vercel.app'),
  openGraph: {
    title: "Sticky - 한국어 이메일 클라이언트 프리뷰",
    description: "HTML 이메일을 입력하면 네이버, Gmail, 다음/카카오 메일에서 어떻게 보이는지 실시간으로 시뮬레이션합니다.",
    url: 'https://sticky-kappa.vercel.app',
    siteName: 'Sticky',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Sticky - 한국어 이메일 클라이언트 프리뷰",
    description: "HTML 이메일을 입력하면 네이버, Gmail, 다음/카카오 메일에서 어떻게 보이는지 실시간으로 시뮬레이션합니다.",
  },
  alternates: {
    canonical: 'https://sticky-kappa.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        />
      </head>
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
