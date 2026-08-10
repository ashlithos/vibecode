import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "今天吃什么",
  description: "库存 + 食谱匹配 + 购物清单",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto flex max-w-3xl items-center gap-6 px-4 py-3 text-sm font-medium">
            <Link href="/" className="text-base font-semibold">
              🍚 今天吃什么
            </Link>
            <Link href="/" className="text-zinc-600 hover:text-zinc-900">
              推荐
            </Link>
            <Link href="/inventory" className="text-zinc-600 hover:text-zinc-900">
              库存
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
