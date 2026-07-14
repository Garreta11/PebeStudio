"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import styles from "./CustomCursor.module.scss";

const HOVER_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label, [data-cursor-hover]";

export type CursorVariant = "default" | "arrow-left" | "arrow-right";

const CURSOR_VARIANT_EVENT = "cursor-variant-change";

// Lets other components (e.g. a multi-item gallery) swap the cursor for a
// directional arrow without CustomCursor needing to know about them.
export function setCursorVariant(variant: CursorVariant) {
  window.dispatchEvent(
    new CustomEvent<CursorVariant>(CURSOR_VARIANT_EVENT, { detail: variant }),
  );
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [variant, setVariant] = useState<CursorVariant>("default");
  // The Sanity Studio admin panel shares this root layout but needs its
  // native cursor for editing, so it opts out of the custom cursor.
  const isStudio = pathname?.startsWith("/studio");
  const isAbout = pathname?.startsWith("/about");

  useEffect(() => {
    if (isStudio) return;
    const handleVariant = (e: Event) => {
      setVariant((e as CustomEvent<CursorVariant>).detail);
    };
    window.addEventListener(CURSOR_VARIANT_EVENT, handleVariant);
    return () =>
      window.removeEventListener(CURSOR_VARIANT_EVENT, handleVariant);
  }, [isStudio]);

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
      className={`${styles.cursor} ${isAbout ? styles.white : ""} ${
        variant === "arrow-left" ? `${styles.arrow} ${styles.arrowLeft}` : ""
      } ${
        variant === "arrow-right" ? `${styles.arrow} ${styles.arrowRight}` : ""
      }`}
    />
  );
}
