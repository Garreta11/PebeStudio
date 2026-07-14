import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/live";
import { PROJECTS_QUERY } from "@/sanity/lib/queries";
import { ArchiveList } from "./ArchiveList";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Archive",
};

export default async function ArchivePage() {
  const { data: projects } = await sanityFetch({ query: PROJECTS_QUERY });

  return (
    <div className={styles.page}>
      {/* <Header /> */}

      <main className={styles.main}>
        {projects && projects.length > 0 ? (
          <ArchiveList projects={projects} />
        ) : (
          <p className={styles.empty}>No projects yet.</p>
        )}
      </main>
    </div>
  );
}
