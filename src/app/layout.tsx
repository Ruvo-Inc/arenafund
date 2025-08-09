import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arena Fund",
  description: "A decisive, elegant, AI‑literate investment collective.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold">Arena Fund</Link>
            <nav className="flex items-center gap-6 text-sm text-gray-700">
              <Link href="/apply">Apply</Link>
              <Link href="/about">About</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-16 border-t border-gray-200">
          <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Arena Fund
          </div>
        </footer>
      </body>
    </html>
  );
}
