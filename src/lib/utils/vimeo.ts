/**
 * Vimeo's player address for one video — `youtube.ts`'s counterpart.
 *
 * There is no thumbnail builder here, unlike YouTube: Vimeo serves a video's
 * still only through its API, so a Vimeo card shows the artwork the maker
 * uploaded, or its empty frame.
 *
 * The id goes through `encodeURIComponent` for the reason `youtube.ts` gives.
 */

/**
 * The embedded player. `dnt=1` asks Vimeo not to track the viewer — the
 * nearest it offers to `youtube-nocookie.com` — and, as with YouTube, the
 * player is only ever loaded after a deliberate press.
 */
export function vimeoEmbedUrl(videoId: string, { autoplay }: { autoplay: boolean }): string {
  const params = new URLSearchParams({ dnt: '1', autoplay: autoplay ? '1' : '0' });
  return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?${params.toString()}`;
}
