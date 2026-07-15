import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { PROJECT_QUERY, PROJECT_SLUGS_QUERY } from "@/sanity/lib/queries";
import { CloseLink } from "./CloseLink";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectReveal } from "./ProjectReveal";
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
      <ProjectReveal className={styles.article__content}>
        <h1 className={styles.article__content__title}>{project.title}</h1>
        <div className={styles.article__content__wrapper}>
          <div className={styles.article__content__description}>
            <PortableText value={project.description} />
          </div>

          {project.gallery && project.gallery.length > 0 && (
            <ProjectGallery images={project.gallery} />
          )}
        </div>
        <div className={styles.article__content__close}>
          <CloseLink href="/archive">
            <p>X</p>
          </CloseLink>
        </div>
      </ProjectReveal>
    </article>
  );
}
