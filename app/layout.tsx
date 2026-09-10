import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manufacturing Stock Control",
  description: "Transaction-led manufacturing inventory and LOT traceability.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
