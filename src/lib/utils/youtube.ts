/**
 * YouTube's three addresses for one video, built in one place.
 *
 * These are YouTube's own public endpoints, not deployment configuration —
 * the same on every environment — so they are constants here rather than
 * environment variables. The *thumbnail* host is also listed in
 * `next.config.ts` `images.remotePatterns`, so `next/image` optimises it.
 *
 * Ids are passed through `encodeURIComponent` even though a YouTube id is
 * `[A-Za-z0-9_-]` in practice: an id is data from the CMS, and a malformed
 * one should produce a URL that 404s, not one that points somewhere else.
 */

/** The watch page — where a card links when JavaScript is not running. */
export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

/**
 * The video's thumbnail. `hqdefault` (480 × 360) because it exists for every
 * video; `maxresdefault` does not, and a missing one is a grey placeholder
 * rather than an error. It is 4:3 with the 16:9 frame letterboxed inside it,
 * so a 16:9 box with `object-cover` crops exactly the bars away.
 */
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

/**
 * The player, on the privacy-enhanced host: `youtube-nocookie.com` sets no
 * cookies until the visitor plays, where `youtube.com/embed` sets them on
 * load. It is only ever loaded after a deliberate press — see
 * `<VideoDialog>` — so in practice that difference is the visitor's
 * own choice.
 *
 * `autoplay` is the caller's decision: true only when the visitor has just
 * pressed play and has not asked for reduced motion. `rel=0` keeps the
 * related videos at the end to this channel's own.
 */
export function youtubeEmbedUrl(videoId: string, { autoplay }: { autoplay: boolean }): string {
  const params = new URLSearchParams({ rel: '0', autoplay: autoplay ? '1' : '0' });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}
