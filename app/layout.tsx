import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DukaanSathi AI — Marketing Assistant for Indian Businesses",
  description:
    "Generate WhatsApp promotions, product listings, and customer replies in English, Hindi & Hinglish. Powered by open-weight AI — built for small Indian businesses.",
  keywords: [
    "AI marketing",
    "Indian small business",
    "WhatsApp promotion",
    "Hindi marketing",
    "Hinglish",
    "product listing",
    "DukaanSathi",
  ],
  openGraph: {
    title: "DukaanSathi AI",
    description: "AI marketing content for small Indian businesses",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
