export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type PortableTextBlock = {
  _type: string;
  children?: Array<{ _type: string; text?: string }>;
};

// Meta descriptions need plain text, but Sanity rich-text fields (like
// project.description) come back as portable text blocks — flatten the
// span text and trim to a sensible meta-description length.
export function portableTextToPlainText(
  blocks: PortableTextBlock[] | null | undefined,
  maxLength = 160,
): string | undefined {
  if (!blocks || blocks.length === 0) return undefined;

  const text = blocks
    .filter((block) => block._type === "block")
    .map((block) =>
      (block.children ?? [])
        .filter((child) => child._type === "span")
        .map((child) => child.text ?? "")
        .join(""),
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return undefined;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
