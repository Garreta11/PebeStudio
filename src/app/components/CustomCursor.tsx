"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import styles from "./CustomCursor.module.scss";

const HOVER_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label, [data-cursor-hover]";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // The Sanity Studio admin panel shares this root layout but needs its
  // native cursor for editing, so it opts out of the custom cursor.
  const isStudio = pathname?.startsWith("/studio");
  const isAbout = pathname?.startsWith("/about");

  useEffect(() => {
    if (isStudio) return;
    document.body.classList.add(styles.hideNativeCursor);
    return () => {
      document.body.classList.remove(styles.hideNativeCursor);
    };
  }, [isStudio]);

  useEffect(() => {
    if (isStudio) return;
    const dot = dotRef.current;
    if (!dot) return;

    const handleMove = (e: MouseEvent) => {
      dot.style.opacity = "1";
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(HOVER_SELECTOR)) {
        dot.classList.add(styles.hover);
      }
    };

    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(HOVER_SELECTOR)) {
        dot.classList.remove(styles.hover);
      }
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [isStudio]);

  if (isStudio) return null;

  return (
    <div
      ref={dotRef}
      className={`${styles.cursor} ${isAbout ? styles.white : ""}`}
    />
  )
}
