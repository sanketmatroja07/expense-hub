import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExpenseHub - Smart Expense Management",
  description: "Track, split, and manage expenses with friends and groups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">
        {children}
      </body>
    </html>
  );
}
