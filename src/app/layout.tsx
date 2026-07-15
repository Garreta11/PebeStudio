import type { Metadata } from "next";
import { draftMode } from "next/headers";
import localFont from 'next/font/local'
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";
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
  title: {
    default: "PEBE STUDIO",
    template: "%s — PEBE STUDIO",
  },
  description: "Pebe Studio — portfolio",
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
      <body className={styles.body}>
        <Header />
        {children}
        <CustomCursor />
        <SanityLive />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
