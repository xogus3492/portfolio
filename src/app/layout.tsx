import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "장태현 | Portfolio",
  description:
    "소프트웨어 엔지니어 장태현의 포트폴리오입니다. Spring Boot, JPA, MySQL, Redis 기반 백엔드 개발을 주로 합니다.",
  keywords: [
    "소프트웨어 엔지니어",
    "포트폴리오",
    "Spring Boot",
    "Java",
    "백엔드",
    "JPA",
    "장태현",
  ],
  authors: [{ name: "장태현" }],
  openGraph: {
    title: "장태현 | Portfolio",
    description: "소프트웨어 엔지니어 장태현의 포트폴리오",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "장태현 | Portfolio",
    description: "소프트웨어 엔지니어 장태현의 포트폴리오",
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
    <html lang="ko" className={`${jetbrainsMono.variable} h-full`}>
      <body className="h-full overflow-hidden bg-vs-bg text-vs-text font-mono">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
