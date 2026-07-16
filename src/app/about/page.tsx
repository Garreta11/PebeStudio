import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/live";
import { ABOUT_QUERY } from "@/sanity/lib/queries";
import { portableTextToPlainText } from "@/lib/seo";
import { Header } from "../components/Header";
import { AboutReveal } from "./AboutReveal";
import styles from "./page.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const { data: about } = await sanityFetch({ query: ABOUT_QUERY });
  const description = portableTextToPlainText(about?.mainDescription);

  return {
    title: "About",
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      title: "About — PEBE STUDIO",
      description,
      url: "/about",
    },
    twitter: {
      title: "About — PEBE STUDIO",
      description,
    },
  };
}

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
};

const portableTextComponents: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
};

export default async function AboutPage() {
  const { data: about } = await sanityFetch({ query: ABOUT_QUERY });

  const exhibitions = about?.exhibitions ?? [];
  const press = about?.press ?? [];
  const interviews = about?.interviews ?? [];
  const social = about?.social ?? [];

  return (
    <div className={styles.page}>
      {/* <Header /> */}

      <AboutReveal className={styles.grid}>
        <section className={styles.column}>
          <h2 className={styles.title}>Info</h2>
          {about?.mainDescription && (
            <div className={styles.body}>
              <PortableText value={about.mainDescription} />
            </div>
          )}
        </section>

        <section className={styles.column}>
          <h2 className={styles.title}>Exhibitions</h2>
          <ul className={styles.list}>
            {exhibitions.map((exhibition, index) => (
              <li key={index} className={styles.listItem}>
                <span className={styles.year}>{exhibition.year}</span>
                <span>{exhibition.title}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.column}>
          <h2 className={styles.title}>Press</h2>
          <ul className={styles.list}>
            {press.map((item, index) => (
              <li key={index}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </li>
            ))}
          </ul>

          <h2 className={styles.title}>Interviews</h2>
          <ul className={styles.list}>
            {interviews.map((item, index) => (
              <li key={index}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.column}>
          <h2 className={styles.title}>Contact</h2>
          {about?.contact && (
            <div className={styles.body}>
              <PortableText
                value={about.contact}
                components={portableTextComponents}
              />
            </div>
          )}

          <h2 className={styles.title}>Social</h2>
          <ul className={styles.list}>
            {social.map((item, index) => (
              <li key={index}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {SOCIAL_LABELS[item.platform] ?? item.platform}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </AboutReveal>
    </div>
  );
}
