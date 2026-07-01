import type { Metadata } from "next";
import { Archivo, Archivo_Black, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400","500","600","700","800","900"],
});
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-archivo-black",
  weight: "400",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400","700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pick-the-cup.vercel.app"),
  title: "Pick The Cup — World Cup 2026 Prediction Bracket",
  description: "Predict the entire FIFA World Cup 2026 knockout stage. Crown your champion, then dare your friends to beat your bracket.",
  openGraph: {
    title: "Pick The Cup — World Cup 2026 Prediction Bracket",
    description: "Predict the entire FIFA World Cup 2026 knockout stage. Crown your champion, then dare your friends to beat your bracket.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pick The Cup — World Cup 2026 Prediction Bracket",
    description: "Predict the entire FIFA World Cup 2026 knockout stage. Crown your champion, then dare your friends to beat your bracket.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${archivoBlack.variable} ${spaceMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
