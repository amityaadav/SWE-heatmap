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
        <div className="mx-auto max-w-[1560px] px-[clamp(16px,4vw,56px)] pt-[clamp(20px,4vw,56px)] pb-20">
          <nav className="mb-5 flex flex-wrap items-center gap-x-[18px] gap-y-[6px] border-b border-ink pb-[10px] font-mono text-[11px] uppercase tracking-[.16em] text-ink-3">
            <a href="/" className="hover:text-ink">
              SWE Heatmap
            </a>
            <span className="text-rule">|</span>
            <a href="/" className="hover:text-ink">
              Dashboard
            </a>
            <a href="/assess" className="hover:text-ink">
              Take Assessment
            </a>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
