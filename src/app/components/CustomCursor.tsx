"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import styles from "./CustomCursor.module.scss";

const HOVER_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label, [data-cursor-hover]";

// Number of points sampled along the trail. Raise for a longer trail,
// lower (or 0) for a shorter/no trail.
const TRAIL_LENGTH = 25;

// How quickly each trailing point eases toward the point ahead of it (0-1).
// Lower = looser, more delayed trail. Higher = tighter, snappier trail.
const TRAIL_EASE = 0.5;

// Stroke width (px) of the trail line.
const TRAIL_WIDTH = 8;
const TRAIL_HOVER_WIDTH = 20;

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
  const pathRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const pathname = usePathname();
  const [variant, setVariant] = useState<CursorVariant>("default");
  const variantRef = useRef<CursorVariant>("default");
  // The Sanity Studio admin panel shares this root layout but needs its
  // native cursor for editing, so it opts out of the custom cursor.
  const isStudio = pathname?.startsWith("/studio");
  const isAbout = pathname?.startsWith("/about");

  useEffect(() => {
    if (isStudio) return;
    const handleVariant = (e: Event) => {
      const next = (e as CustomEvent<CursorVariant>).detail;
      variantRef.current = next;
      setVariant(next);
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
    const path = pathRef.current;
    const gradient = gradientRef.current;
    if (!dot || !path || !gradient) return;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const trailPositions = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: mouse.x,
      y: mouse.y,
    }));

    const updatePosition = (x: number, y: number) => {
      dot.style.opacity = "1";
      path.style.opacity = variantRef.current === "default" ? "1" : "0";
      mouse.x = x;
      mouse.y = y;
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
    };

    const handleMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(HOVER_SELECTOR)) {
        dot.classList.add(styles.hover);
        path.style.strokeWidth = `${TRAIL_HOVER_WIDTH}px`;
      }
    };

    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(HOVER_SELECTOR)) {
        dot.classList.remove(styles.hover);
        path.style.strokeWidth = `${TRAIL_WIDTH}px`;
      }
    };

    // On touch devices there's no persistent pointer, so the trail is
    // revealed on touchstart, follows the finger on touchmove, and fades
    // out again on touchend/touchcancel.
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      updatePosition(touch.clientX, touch.clientY);
      trailPositions.forEach((pos) => {
        pos.x = touch.clientX;
        pos.y = touch.clientY;
      });
      const target = document.elementFromPoint(
        touch.clientX,
        touch.clientY,
      ) as HTMLElement | null;
      if (target?.closest(HOVER_SELECTOR)) {
        dot.classList.add(styles.hover);
        path.style.strokeWidth = `${TRAIL_HOVER_WIDTH}px`;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      updatePosition(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      dot.style.opacity = "0";
      path.style.opacity = "0";
      dot.classList.remove(styles.hover);
      path.style.strokeWidth = `${TRAIL_WIDTH}px`;
    };

    let frame: number;
    const tick = () => {
      let targetX = mouse.x;
      let targetY = mouse.y;

      trailPositions.forEach((pos) => {
        pos.x += (targetX - pos.x) * TRAIL_EASE;
        pos.y += (targetY - pos.y) * TRAIL_EASE;
        targetX = pos.x;
        targetY = pos.y;
      });

      // Redraw the whole trail as one continuous stroke each frame, so
      // fast mouse movement never shows gaps between sampled points.
      let d = `M ${mouse.x} ${mouse.y}`;
      trailPositions.forEach((pos) => {
        d += ` L ${pos.x} ${pos.y}`;
      });
      path.setAttribute("d", d);

      const tail = trailPositions[trailPositions.length - 1];
      gradient.setAttribute("x1", String(mouse.x));
      gradient.setAttribute("y1", String(mouse.y));
      gradient.setAttribute("x2", String(tail.x));
      gradient.setAttribute("y2", String(tail.y));

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isStudio]);

  if (isStudio) return null;

  const trailColor = isAbout ? "#ffffff" : "#0127ff";

  return (
    <>
      <svg className={styles.trailSvg}>
        <defs>
          <linearGradient
            ref={gradientRef}
            id="cursorTrailGradient"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={trailColor} stopOpacity="q" />
            <stop offset="100%" stopColor={trailColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          className={styles.trailLine}
          fill="none"
          stroke="url(#cursorTrailGradient)"
          style={{ strokeWidth: TRAIL_WIDTH }}
        />
      </svg>
      <div
        ref={dotRef}
        className={`${styles.cursor} ${isAbout ? styles.white : ""} ${
          variant === "arrow-left" ? `${styles.arrow} ${styles.arrowLeft}` : ""
        } ${
          variant === "arrow-right" ? `${styles.arrow} ${styles.arrowRight}` : ""
        }`}
      />
    </>
  );
}
