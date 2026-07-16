import type { Metadata } from "next";
import Link from "next/link";

import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import styles from "./page.module.scss";
import { Header } from "./components/Header";
import { HomeCarousel } from "./components/HomeCarousel";

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({ query: SITE_SETTINGS_QUERY });

  const title = settings?.seo?.title || settings?.title || "PEBE STUDIO";
  const description =
    settings?.seo?.description ||
    settings?.description ||
    settings?.tagline ||
    undefined;
  const image = settings?.seo?.image?.asset?.url;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: "/",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function Home() {
  const { data: homepage } = await sanityFetch({ query: HOMEPAGE_QUERY });

  const items = homepage?.items ?? [];

  return (
    <div className={styles.page}>
      {/* <Header /> */}

      <main className={styles.main}>
        {items.length > 0 ? (
          <HomeCarousel items={items} />
        ) : (
          <p className={styles.empty}>
            No homepage items yet.{" "}
            <Link href="/studio" className={styles.emptyLink}>
              Add some in the Studio.
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
