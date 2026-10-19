'use client';

import { useRef, useState, type ReactNode } from 'react';
import type { ConsentCopy } from '@/components/ui/consent-actions';
import { ConsentDialog } from '@/components/ui/consent-dialog';
import { DocumentRowBody, documentRow } from '@/components/ui/document-link';
import { cn } from '@/lib/utils/cn';

export interface GatedDocumentLinkProps {
  /** The document's id — what `reveal` is asked for. */
  id: string;
  title: string;
  /** Shown verbatim, e.g. `"PDF"`. */
  fileType?: string;
  ground?: 'paper' | 'dark';
  copy: ConsentCopy;
  /** Server-rendered notice text. */
  notice: ReactNode;
  /**
   * A Server Action: the document's URL for `id`, or `null`. Called only on
   * "I Confirm", and on every confirmation — nothing is cached here.
   */
  reveal: (id: string) => Promise<string | null>;
}

/**
 * A document row that asks first: activating it opens a consent notice, and
 * only "I Confirm" opens the document.
 *
 * **The legacy DRHP behaviour, exactly.** The page lists the document; the
 * link opens the disclaimer; "I Confirm" closes it and opens the PDF in a new
 * tab; "I Do Not Confirm" and × close it and nothing else happens. The next
 * click asks again — the legacy page remembers nothing, not even within one
 * visit, and neither does this.
 *
 * **It is a `<button>`, not a link**, because until the reader confirms
 * there is no URL on the page to link to. The legacy page put the PDF's path
 * in an inline script, readable in the source by anyone; here the URL is
 * fetched by a Server Action on "I Confirm" and exists nowhere in the HTML or
 * the RSC payload before that. It looks exactly like `<DocumentLink>`
 * because it is one to the reader — the same row, the same glyph —
 * and `aria-haspopup="dialog"` tells a screen reader what pressing it does.
 *
 * **Why the tab is opened before the URL is known.** A browser only lets a
 * page open a tab in direct response to a click. The URL arrives after an
 * `await`, by which time Safari in particular no longer counts it as one and
 * blocks the tab. So the tab is opened blank inside the click, and pointed at
 * the document when the URL lands — with `opener` cleared first, which is
 * what `rel="noopener"` would have done. If the tab was blocked anyway, the
 * document opens in this one; if the fetch fails, the blank tab is closed and
 * the dialog says so, with the button there to try again.
 */
export function GatedDocumentLink({
  id,
  title,
  fileType = 'PDF',
  ground = 'dark',
  copy,
  notice,
  reveal,
}: GatedDocumentLinkProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function confirm() {
    const tab = window.open('', '_blank');
    setPending(true);
    setFailed(false);

    let href: string | null = null;
    try {
      href = await reveal(id);
    } catch {
      // Network failure, or a Server Action ID rotated by a deploy while the
      // page was open. The message covers both; a reload fixes the second.
      href = null;
    }

    setPending(false);

    if (href === null) {
      tab?.close();
      setFailed(true);
      return;
    }

    setOpen(false);

    if (tab === null) {
      // The new tab was blocked outright, so the document opens in this one.
      // It is the blob's absolute URL on another origin — a document, not a
      // route — so this is a plain browser navigation, not a router push.
      window.open(href, '_self');
      return;
    }

    tab.opener = null;
    tab.location.replace(href);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          setFailed(false);
          setOpen(true);
        }}
        className={cn(documentRow({ ground }), 'w-full cursor-pointer text-left')}
      >
        <DocumentRowBody title={title} fileType={fileType} ground={ground} typeMark />
      </button>

      <ConsentDialog
        open={open}
        heading={copy.heading}
        closeLabel={copy.closeLabel}
        confirmLabel={copy.confirmLabel}
        declineLabel={copy.declineLabel}
        onConfirm={() => void confirm()}
        decline={{
          kind: 'dismiss',
          onDismiss: () => {
            setOpen(false);
          },
        }}
        pending={pending}
        error={failed ? copy.errorMessage : null}
        returnFocusRef={triggerRef}
      >
        {notice}
      </ConsentDialog>
    </>
  );
}
