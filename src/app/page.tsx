import Link from "next/link";

import { sanityFetch } from "@/sanity/lib/live";
import { HOMEPAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import styles from "./page.module.scss";
import { Header } from "./components/Header";
import { HomeCarousel } from "./components/HomeCarousel";

export default async function Home() {
  const [{ data: settings }, { data: homepage }] = await Promise.all([
    sanityFetch({ query: SITE_SETTINGS_QUERY }),
    sanityFetch({ query: HOMEPAGE_QUERY }),
  ]);

  const title = settings?.title || "Pebe Studio";
  const tagline = settings?.tagline || "Portfolio";
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
