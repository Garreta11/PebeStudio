// Sanity's asset CDN accepts resize/format/quality params directly on any
// cdn.sanity.io file URL, so we don't need the @sanity/image-url builder
// (which needs a project/dataset config) just to downscale an already
// resolved asset URL.
type SanityImageUrlOptions = {
  width?: number;
  height?: number;
  quality?: number;
  // `auto=format` picks avif/webp per-browser but rasterizes animated GIFs
  // to a single frame. Explicit `fm=webp` compresses just as well while
  // keeping the animation (verified: RIFF ANIM/ANMF chunks survive).
  animated?: boolean;
};

export function sanityImageUrl(
  url: string,
  { width, height, quality = 75, animated = false }: SanityImageUrlOptions,
) {
  const u = new URL(url);
  if (width) u.searchParams.set("w", String(Math.round(width)));
  if (height) u.searchParams.set("h", String(Math.round(height)));
  u.searchParams.set("fit", "max");
  u.searchParams.set("q", String(quality));
  if (animated) {
    u.searchParams.set("fm", "webp");
  } else {
    u.searchParams.set("auto", "format");
  }
  return u.toString();
}
