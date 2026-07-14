import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { PROJECT_QUERY, PROJECT_SLUGS_QUERY } from "@/sanity/lib/queries";
import styles from "./page.module.scss";

export async function generateStaticParams() {
  return client.withConfig({ useCdn: false }).fetch(PROJECT_SLUGS_QUERY);
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: project } = await sanityFetch({
    query: PROJECT_QUERY,
    params: { slug },
  });

  return { title: project?.title };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const { data: project } = await sanityFetch({
    query: PROJECT_QUERY,
    params: { slug },
  });

  if (!project) notFound();

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.meta}>
          {[project.client, project.year].filter(Boolean).join(" · ")}
        </p>
      </header>

      {project.description && (
        <div className={styles.body}>
          <PortableText value={project.description} />
        </div>
      )}

      {project.gallery && project.gallery.length > 0 && (
        <div className={styles.gallery}>
          {project.gallery.map((image, index) => (
            <div
              key={image.asset?._id || index}
              className={styles.galleryItem}
            >
              {image.asset?.url && (
                <Image
                  src={image.asset.url}
                  alt={image.alt || ""}
                  fill
                  className={styles.galleryImage}
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
