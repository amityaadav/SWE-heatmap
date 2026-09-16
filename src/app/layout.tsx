import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SWE Knowledge Heatmap",
  description: "Interactive software engineering self-assessment tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-[var(--border)] px-4 py-3">
          <nav className="mx-auto flex max-w-6xl items-center justify-between">
            <a href="/" className="text-lg font-semibold">
              SWE Heatmap
            </a>
            <a
              href="/assess"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Take Assessment
            </a>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
