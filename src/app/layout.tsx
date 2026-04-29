import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "장태현 | Portfolio",
  description:
    "풀스택 개발자 장태현의 포트폴리오입니다. Next.js, TypeScript, React를 주로 사용합니다.",
  keywords: ["개발자", "포트폴리오", "Next.js", "TypeScript", "React"],
  authors: [{ name: "장태현" }],
  openGraph: {
    title: "장태현 | Portfolio",
    description: "풀스택 개발자 장태현의 포트폴리오",
    type: "website",
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
      </body>
    </html>
  );
}
