import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";

export const metadata: Metadata = {
  title: "AI-Dating - AI 开发者社区",
  description: "A Date with AI: The AI Developer Community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
