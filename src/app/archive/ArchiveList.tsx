"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import type { PROJECTS_QUERY_RESULT } from "../../../sanity.types";
import styles from "./page.module.scss";

type Props = {
  projects: PROJECTS_QUERY_RESULT;
};

export function ArchiveList({ projects }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const items = listRef.current?.querySelectorAll(`.${styles.item}`);
    if (!items || items.length === 0) return;

    const tween = gsap.fromTo(
      items,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.inOut",
        stagger: 0.03,
      },
    );

    return () => {
      tween.kill();
    };
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;

    const handleMove = (e: MouseEvent) => {
      preview.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY + 100}px, 0) translateY(-50%)`;
    };

    list.addEventListener("mousemove", handleMove);
    return () => list.removeEventListener("mousemove", handleMove);
  }, []);

  useLayoutEffect(() => {
    const content = previewContentRef.current;
    if (!content) return;

    const tween = gsap.fromTo(
      content,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" },
    );

    return () => {
      tween.kill();
    };
  }, [hoveredId]);

  const hoveredProject = projects.find((project) => project._id === hoveredId);

  return (
    <>
      <ul ref={listRef} className={styles.list}>
        {projects.map((project) => (
          <li
            key={project._id}
            className={styles.item}
            onMouseEnter={() => setHoveredId(project._id)}
            onMouseLeave={() =>
              setHoveredId((current) =>
                current === project._id ? null : current,
              )
            }
          >
            <Link href={`/archive/${project.slug}`} className={styles.row}>
              <span className={styles.title}>{project.title}</span>
              <span className={`${styles.meta} ${styles.categories}`}>
                {project.categories}
              </span>
              <span className={`${styles.meta} ${styles.client}`}>
                {project.client}
              </span>
              <span className={`${styles.meta} ${styles.year}`}>
                {project.year}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div
        ref={previewRef}
        className={`${styles.preview} ${hoveredProject ? styles.previewVisible : ""}`}
      >
        <div
          key={hoveredProject?._id}
          ref={previewContentRef}
          className={styles.previewContent}
        >
          {hoveredProject?.coverImage?.asset?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hoveredProject.coverImage.asset.url}
              alt={hoveredProject.coverImage.alt || hoveredProject.title}
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.previewFallback} />
          )}
        </div>
      </div>
    </>
  );
}
