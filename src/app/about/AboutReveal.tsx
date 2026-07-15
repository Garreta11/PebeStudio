"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

import styles from "./page.module.scss";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function AboutReveal({ className, children }: Props) {
  const mainRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const targets = main.querySelectorAll(
      `.${styles.title}, .${styles.body} > *, .${styles.list} > li`,
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
        stagger: 0.05,
      },
    );

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <main ref={mainRef} className={className}>
      {children}
    </main>
  );
}
