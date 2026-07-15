"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

import styles from "./page.module.scss";

type Props = {
  href: string;
  children: React.ReactNode;
};

export function CloseLink({ href, children }: Props) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified/non-primary clicks (open in new tab, etc.) behave normally.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();

    const content = e.currentTarget.closest(
      `.${styles.article__content}`,
    ) as HTMLElement | null;

    if (!content) {
      router.push(href);
      return;
    }

    gsap.to(content, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => router.push(href),
    });
  };

  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}
