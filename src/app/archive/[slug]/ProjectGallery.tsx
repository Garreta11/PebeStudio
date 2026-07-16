"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { setCursorVariant } from "../../components/CustomCursor";
import type { PROJECT_QUERY_RESULT } from "../../../../sanity.types";
import styles from "./page.module.scss";

type GalleryItem = NonNullable<
  NonNullable<PROJECT_QUERY_RESULT>["gallery"]
>[number];

type Props = {
  images: GalleryItem[];
  title: string;
};

// Minimum horizontal swipe distance (px) before a touch drag counts as a
// slide change, so small taps/scroll jitter don't trigger navigation.
const SWIPE_THRESHOLD = 50;

// Matches the mobile breakpoint used throughout page.module.scss. Below
// this width the gallery becomes a draggable carousel instead of the
// desktop tap-to-navigate view.
const MOBILE_QUERY = "(max-width: 700px)";

function renderMedia(item: GalleryItem, title: string) {
  return item.mediaType === "video" && item.videoUrl ? (
    <video
      key={item.videoUrl}
      className={styles.article__content__media__image}
      src={item.videoUrl}
      autoPlay
      muted
      loop
      playsInline
    />
  ) : item.image?.asset?.url ? (
    // Native <img>/<video> so each item keeps its own aspect ratio instead
    // of being cropped into a fixed box.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={item.image.asset._id}
      className={styles.article__content__media__image}
      src={item.image.asset.url}
      alt={item.image.alt || title}
    />
  ) : null;
}

export function ProjectGallery({ images, title }: Props) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const current = images[index];
  const hasMultiple = images.length > 1;
  const lastSideRef = useRef<"left" | "right" | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const widthRef = useRef(0);
  const mediaRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);

  // Live drag offset (px) layered on top of the track's centered position,
  // plus whether we're mid-drag (no transition) or mid-snap (animated).
  const [dragX, setDragX] = useState(0);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // Reset the cursor if this gallery unmounts (e.g. navigating away)
    // while an arrow variant is still showing.
    return () => setCursorVariant("default");
  }, []);

  useLayoutEffect(() => {
    const targets = [mediaRef.current, counterRef.current].filter(
      Boolean,
    ) as HTMLElement[];
    if (targets.length === 0) return;

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.08,
      },
    );

    return () => {
      tween.kill();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMultiple || isMobile) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const side = e.clientX - left > width / 2 ? "right" : "left";

    if (side !== lastSideRef.current) {
      lastSideRef.current = side;
      setCursorVariant(side === "right" ? "arrow-right" : "arrow-left");
    }
  };

  const handleMouseLeave = () => {
    if (!hasMultiple || isMobile) return;
    lastSideRef.current = null;
    setCursorVariant("default");
  };

  const goToNext = () => {
    setIndex((current) => (current + 1) % images.length);
  };

  const goToPrev = () => {
    setIndex((current) => (current - 1 + images.length) % images.length);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // On mobile the carousel is driven by dragging, not tap zones.
    if (isMobile) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const clickedRight = e.clientX - left > width / 2;

    if (clickedRight) goToNext();
    else goToPrev();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultiple || !isMobile) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    widthRef.current = e.currentTarget.getBoundingClientRect().width;
    setSettling(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    if (!start) return;
    const touch = e.touches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    // Mostly-vertical gesture: let the page behave normally instead of
    // dragging the carousel sideways.
    if (Math.abs(dy) > Math.abs(dx)) return;

    setDragX(dx);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const width = widthRef.current || 1;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    setSettling(true);

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) {
      // Not far enough (or too vertical): ease back to the current slide.
      setDragX(0);
      return;
    }

    // Finish the slide in the direction the user was already dragging.
    setDragX(dx < 0 ? -width : width);
  };

  const handleTrackTransitionEnd = () => {
    if (!settling) return;
    setSettling(false);

    if (dragX < 0) goToNext();
    else if (dragX > 0) goToPrev();

    // Recenter the track on the new current slide instantly (no
    // transition) so the completed swipe doesn't visibly snap back first.
    setDragX(0);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  const prevIndex = (index - 1 + images.length) % images.length;
  const nextIndex = (index + 1) % images.length;
  const showTrack = isMobile && hasMultiple;

  return (
    <>
      <div
        ref={mediaRef}
        className={styles.article__content__media}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
      >
        {showTrack ? (
          <div
            className={styles.article__content__media__track}
            style={{
              transform: `translate3d(calc(-100% + ${dragX}px), 0, 0)`,
              transition: settling ? "transform 0.3s ease" : "none",
            }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            <div className={styles.article__content__media__slide}>
              {renderMedia(images[prevIndex], title)}
            </div>
            <div className={styles.article__content__media__slide}>
              {renderMedia(current, title)}
            </div>
            <div className={styles.article__content__media__slide}>
              {renderMedia(images[nextIndex], title)}
            </div>
          </div>
        ) : (
          renderMedia(current, title)
        )}
      </div>
      <p ref={counterRef} className={styles.article__content__media__counter}>
        {pad(index + 1)}/{pad(images.length)}
      </p>
    </>
  );
}
