"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Header.module.scss";

export function Header() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isArchive = pathname === "/archive";

  return (
    <header
      className={`${styles.header} ${isHomepage ? styles.blend : ""} ${isArchive ? styles.black : ""}`}
    >
      <Link href="/" className={styles.title}>
        PEBE STUDIO
      </Link>
      <nav className={styles.nav}>
        <Link href="/about" className={styles.navLink}>
          ABOUT
        </Link>
        <span>,&nbsp;&nbsp;</span>
        <Link href="/archive" className={styles.navLink}>
          ARCHIVE
        </Link>
      </nav>
    </header>
  );
}
