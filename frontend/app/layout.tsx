import type { Metadata } from "next";
import { Inter, Playfair_Display, Dancing_Script, Sacramento, VT323 } from "next/font/google";
import { ThemeProvider } from "../components/ThemeProvider";
import GlobalHeader from "../components/GlobalHeader";
import PopUpBlessing from "../components/PopUpBlessing";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const dancing = Dancing_Script({
  variable: "--font-handwriting",
  subsets: ["latin"],
});

const sacramento = Sacramento({
  weight: "400",
  variable: "--font-cursive",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
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
      className="h-full antialiased"
    >
      <body className={`${inter.variable} ${playfair.variable} ${dancing.variable} ${sacramento.variable} ${vt323.variable} min-h-full flex flex-col font-sans bg-background selection:bg-rose-gold/30 selection:text-deep-velvet transition-colors duration-500`}>
        <ThemeProvider>
          <GlobalHeader />
          <PopUpBlessing />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
