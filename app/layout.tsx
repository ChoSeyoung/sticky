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
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4595496614643694"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Sticky — Korean Email Client Preview",
              "alternateName": ["한국 이메일 클라이언트 프리뷰", "이메일 미리보기 도구"],
              "url": "https://sticky-kappa.vercel.app",
              "description": "HTML 이메일이 네이버 메일, Gmail, 다음/카카오 메일, Outlook에서 어떻게 보이는지 실시간으로 시뮬레이션하는 무료 웹 도구입니다. 각 이메일 클라이언트의 CSS 제한사항을 정확히 반영합니다.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web",
              "browserRequirements": "Requires JavaScript",
              "inLanguage": "ko",
              "isAccessibleForFree": true,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "KRW"
              },
              "featureList": [
                "네이버 메일 CSS 시뮬레이션",
                "Gmail CSS 시뮬레이션",
                "다음/카카오 메일 CSS 시뮬레이션",
                "Outlook Classic CSS 시뮬레이션",
                "Outlook New CSS 시뮬레이션",
                "실시간 HTML 이메일 미리보기",
                "CSS 인라이닝 자동 처리",
                "이메일 호환성 경고 패널"
              ],
              "keywords": "HTML 이메일 테스트, 이메일 미리보기, 네이버 메일 미리보기, 한국 이메일 클라이언트, 이메일 디자인 도구"
            })
          }}
        />
      </head>
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
