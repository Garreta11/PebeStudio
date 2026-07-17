"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { sanityImageUrl } from "@/sanity/lib/image";
import styles from "./HomeCarousel.module.scss";

type HomeCarouselItem = {
  mediaType: "image" | "gif" | "video";
  image: {
    asset: {
      url: string;
      metadata?: {
        lqip?: string | null;
        dimensions?: { width: number; height: number } | null;
      } | null;
    } | null;
    alt: string | null;
  } | null;
  videoUrl: string | null;
  project: { title: string; slug: string };
};

// The row is always 100dvh tall (see page.module.scss), so requesting a
// height-capped, format/quality-optimized asset (instead of the raw,
// often multi-megabyte Sanity original) covers every real viewport while
// cutting payload size by an order of magnitude or more.
const IMAGE_HEIGHT = 1800;

type Props = {
  items: HomeCarouselItem[];
};

const BASE_SPEED = 100; // ambient px/s once everything has settled
const INERTIA_DECAY = 0.09; // per-second decay factor easing velocity toward the ambient speed
const DRAG_THRESHOLD = 5; // px of movement before a press becomes a drag
const COPIES = 3; // one set before, the original, one set after

export function HomeCarousel({ items }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const xRef = useRef(0);
  const directionRef = useRef<1 | -1>(-1);
  const velocityRef = useRef(directionRef.current * BASE_SPEED);
  const setWidthRef = useRef(0);
  const initializedRef = useRef(false);

  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragMovedRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const lastWheelTimeRef = useRef(0);

  const applyTransform = () => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
    }
  };

  // Keeps x within a single copy's worth of travel, wrapping seamlessly
  // since the copy on either side is identical to the one we leave.
  const wrap = () => {
    const setWidth = setWidthRef.current;
    if (setWidth <= 0) return;
    while (xRef.current <= -2 * setWidth) {
      xRef.current += setWidth;
      if (draggingRef.current) dragStartXRef.current += setWidth;
    }
    while (xRef.current >= 0) {
      xRef.current -= setWidth;
      if (draggingRef.current) dragStartXRef.current -= setWidth;
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const setWidth = track.scrollWidth / COPIES;
      if (setWidth > 0 && setWidth !== setWidthRef.current) {
        setWidthRef.current = setWidth;
        if (!initializedRef.current) {
          // Start at a random offset within one set's width so the
          // carousel doesn't always open on the same frame.
          xRef.current = -setWidth - Math.random() * setWidth;
          initializedRef.current = true;
          applyTransform();
          // Wait a frame so the jump to the random position is painted
          // before we fade in, hiding the repositioning glitch.
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setReady(true)),
          );
        }
      }
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    return () => resizeObserver.disconnect();
  }, [items]);

  useEffect(() => {
    let rafId: number;
    let lastTime: number | null = null;

    const tick = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!draggingRef.current && setWidthRef.current > 0) {
        // Ease the current velocity toward the ambient speed. Right after a
        // fling this glides down from the release speed (inertia); once it
        // has settled it just holds steady at the ambient speed.
        const target = directionRef.current * BASE_SPEED;
        velocityRef.current =
          target + (velocityRef.current - target) * Math.pow(INERTIA_DECAY, dt);
        xRef.current += velocityRef.current * dt;
        wrap();
        applyTransform();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Don't capture the pointer (or mark this as a drag) yet — a plain
      // click needs to reach the underlying <Link> untouched. We only
      // commit to dragging once the press crosses DRAG_THRESHOLD below.
      draggingRef.current = false;
      dragMovedRef.current = 0;
      dragVelocityRef.current = 0;
      pointerIdRef.current = e.pointerId;
      pointerStartXRef.current = e.clientX;
      dragStartXRef.current = xRef.current;
      lastPointerTimeRef.current = performance.now();
      lastPointerXRef.current = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      const delta = e.clientX - pointerStartXRef.current;

      if (!draggingRef.current) {
        if (Math.abs(delta) < DRAG_THRESHOLD) return;
        // Crossed the threshold: this is a real drag now. Capturing the
        // pointer here (instead of on pointerdown) is what lets a plain
        // click's event still target the <Link> and navigate normally.
        draggingRef.current = true;
        container.setPointerCapture(e.pointerId);
        container.classList.add(styles.dragging);
      }

      dragMovedRef.current = delta;
      xRef.current = dragStartXRef.current + delta;
      wrap();
      applyTransform();

      const now = performance.now();
      const dt = (now - lastPointerTimeRef.current) / 1000;
      if (dt > 0) {
        const instantVelocity = (e.clientX - lastPointerXRef.current) / dt;
        // Smooth out noisy per-event velocity so a single jittery sample
        // right before release doesn't dominate the resulting fling.
        dragVelocityRef.current =
          dragVelocityRef.current * 0.8 + instantVelocity * 0.2;
      }
      lastPointerTimeRef.current = now;
      lastPointerXRef.current = e.clientX;
    };

    const endDrag = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;
      if (!draggingRef.current) return;
      draggingRef.current = false;
      container.classList.remove(styles.dragging);
      velocityRef.current = dragVelocityRef.current;
      if (dragVelocityRef.current > 0) directionRef.current = 1;
      else if (dragVelocityRef.current < 0) directionRef.current = -1;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const scale =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? container.clientWidth : 1;
      const delta =
        (Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY) *
        scale;

      xRef.current -= delta;
      wrap();
      applyTransform();

      const now = performance.now();
      const dt = lastWheelTimeRef.current
        ? Math.min((now - lastWheelTimeRef.current) / 1000, 0.1)
        : 0.016;
      lastWheelTimeRef.current = now;

      const instantVelocity = -delta / dt;
      velocityRef.current = velocityRef.current * 0.7 + instantVelocity * 0.3;
      if (Math.abs(velocityRef.current) > 1) {
        directionRef.current = velocityRef.current > 0 ? 1 : -1;
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", endDrag);
      container.removeEventListener("pointercancel", endDrag);
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.carousel} ${ready ? styles.ready : ""}`}
    >
      <div ref={trackRef} className={styles.track}>
        {Array.from({ length: COPIES }).map((_, copyIndex) =>
          items.map((item, itemIndex) => {
            const alt = item.image?.alt || item.project.title;
            const dimensions = item.image?.asset?.metadata?.dimensions;
            // Middle copy is where the carousel opens, so it loads eagerly;
            // the two wrap-around copies only need to be there once the
            // user has scrolled far enough to reach them.
            const isPrimaryCopy = copyIndex === 1;
            return (
              <Link
                key={`${copyIndex}-${itemIndex}`}
                href={`/archive/${item.project.slug}`}
                className={styles.item}
                draggable={false}
                onClick={(e) => {
                  if (Math.abs(dragMovedRef.current) > DRAG_THRESHOLD) {
                    e.preventDefault();
                  }
                }}
              >
                {item.mediaType === "video" && item.videoUrl ? (
                  <video
                    className={styles.media}
                    src={item.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={isPrimaryCopy ? "auto" : "metadata"}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : item.image?.asset?.url ? (
                  // Native <img> so width can derive from height while
                  // keeping the asset's original aspect ratio intact.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={styles.media}
                    src={sanityImageUrl(item.image.asset.url, {
                      height: IMAGE_HEIGHT,
                      animated: item.mediaType === "gif",
                    })}
                    alt={alt}
                    width={dimensions?.width}
                    height={dimensions?.height}
                    loading={isPrimaryCopy ? "eager" : "lazy"}
                    fetchPriority={isPrimaryCopy ? "high" : "low"}
                    decoding="async"
                    style={
                      item.image.asset.metadata?.lqip
                        ? { backgroundImage: `url(${item.image.asset.metadata.lqip})` }
                        : undefined
                    }
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : null}
              </Link>
            );
          }),
        )}
      </div>
    </div>
  );
}
