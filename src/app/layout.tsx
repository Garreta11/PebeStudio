import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import localFont from 'next/font/local'
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";
import { siteUrl } from "@/lib/seo";
import { CustomCursor } from "./components/CustomCursor";
import { Header } from "./components/Header";
import "./globals.scss";
import styles from "./layout.module.scss";

const groteskFont = localFont({
  src: './fonts/CargoMonumentGroteskPlusVariable.woff2',
  display: 'swap',
  variable: '--font-grotesk', // optional, if you want a CSS variable
})


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PEBE STUDIO",
    template: "%s — PEBE STUDIO",
  },
  description: "Pebe Studio — portfolio",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "PEBE STUDIO",
    title: "PEBE STUDIO",
    description: "Pebe Studio — portfolio",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "PEBE STUDIO",
    description: "Pebe Studio — portfolio",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDraftMode = (await draftMode()).isEnabled;

  return (
    <html
      lang="en"
      className={`${styles.html} ${groteskFont.variable}`}
    >
      <body className={styles.body} suppressHydrationWarning>
        <Header />
        {children}
        <CustomCursor />
        <SanityLive />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
