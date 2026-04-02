import type { Metadata } from "next";
import { Amiri, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Interactive Quran – Click to Recite",
  description:
    "An interactive Mushaf web application. Click on any Ayah to hear its recitation with Uthmani script and multiple reciters.",
  keywords: ["Quran", "Mushaf", "Recitation", "Tajweed", "Islamic", "Arabic"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${amiri.variable}`}>
      <body className="bg-mushaf-bg font-sans text-mushaf-text antialiased">
        {children}
      </body>
    </html>
  );
}
