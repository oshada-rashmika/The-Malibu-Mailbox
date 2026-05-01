import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Malibu Mailbox",
  description: "Your love story is waiting inside...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-silk-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-blush-pink/20 selection:bg-rose-gold/30 selection:text-deep-velvet">
        {children}
      </body>
    </html>
  );
}
