"use client";

import { useEffect, useRef, useState } from "react";

import { setCursorVariant } from "../../components/CustomCursor";
import type { PROJECT_QUERY_RESULT } from "../../../../sanity.types";
import styles from "./page.module.scss";

type GalleryItem = NonNullable<
  NonNullable<PROJECT_QUERY_RESULT>["gallery"]
>[number];

type Props = {
  images: GalleryItem[];
};

export function ProjectGallery({ images }: Props) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  const hasMultiple = images.length > 1;
  const lastSideRef = useRef<"left" | "right" | null>(null);

  useEffect(() => {
    // Reset the cursor if this gallery unmounts (e.g. navigating away)
    // while an arrow variant is still showing.
    return () => setCursorVariant("default");
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMultiple) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const side = e.clientX - left > width / 2 ? "right" : "left";

    if (side !== lastSideRef.current) {
      lastSideRef.current = side;
      setCursorVariant(side === "right" ? "arrow-right" : "arrow-left");
    }
  };

  const handleMouseLeave = () => {
    if (!hasMultiple) return;
    lastSideRef.current = null;
    setCursorVariant("default");
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const clickedRight = e.clientX - left > width / 2;

    setIndex((current) => {
      if (clickedRight) return (current + 1) % images.length;
      return (current - 1 + images.length) % images.length;
    });
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <div
        className={styles.article__content__media}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
      >
        {current.mediaType === "video" && current.videoUrl ? (
          <video
            key={current.videoUrl}
            className={styles.article__content__media__image}
            src={current.videoUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : current.image?.asset?.url ? (
          // Native <img> so each item keeps its own aspect ratio instead of
          // being cropped into a fixed box.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.image.asset._id}
            className={styles.article__content__media__image}
            src={current.image.asset.url}
            alt={current.image.alt || ""}
          />
        ) : null}
      </div>
      <p className={styles.article__content__media__counter}>
        {pad(index + 1)}/{pad(images.length)}
      </p>
    </>
  );
}
