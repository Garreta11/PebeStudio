"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import styles from "./page.module.scss";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function ProjectReveal({ className, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll(
      `.${styles.article__content__title}, .${styles.article__content__description} > *`,
    );
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

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
