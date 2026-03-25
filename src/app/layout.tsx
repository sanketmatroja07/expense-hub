import type { Metadata } from "next";
import "./globals.css";
import { ExpenseHubProvider } from "@/lib/expense-hub-store";

export const metadata: Metadata = {
  title: {
    default: "ExpenseHub",
    template: "%s | ExpenseHub",
  },
  description: "Track, split, and settle shared expenses with a fast, polished dashboard.",
  applicationName: "ExpenseHub",
  appleWebApp: {
    capable: true,
    title: "ExpenseHub",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "ExpenseHub",
    description:
      "Track personal spending, split group costs, and keep balances clear.",
    type: "website",
    siteName: "ExpenseHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpenseHub",
    description:
      "A cleaner way to manage personal and shared expenses in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">
        <ExpenseHubProvider>{children}</ExpenseHubProvider>
      </body>
    </html>
  );
}
