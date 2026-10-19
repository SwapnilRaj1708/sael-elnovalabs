import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** A run of text inside a paragraph, list item or emphasis. */
export type ProseInline =
  | string
  | { kind: 'strong'; children: readonly ProseInline[] }
  | { kind: 'em'; children: readonly ProseInline[] }
  /** Rendered as a `mailto:` link whose text is the address. */
  | { kind: 'email'; address: string };

/**
 * One block of a long-form document. Headings carry their text verbatim —
 * clause numbers included ("1. Conditions of Use") — and their anchor id is
 * derived from it by `proseHeadingId`, so it is stable across releases.
 */
export type ProseBlock =
  | { kind: 'heading'; level: 2 | 3 | 4; text: string }
  | { kind: 'paragraph'; children: readonly ProseInline[] }
  | { kind: 'ordered-list'; items: readonly (readonly ProseInline[])[] }
  | { kind: 'unordered-list'; items: readonly (readonly ProseInline[])[] };

export interface LongformProseProps {
  blocks: readonly ProseBlock[];
  /**
   * The column's width, always centred. `article`, the default, is the
   * reading measure (`--measure-article`). `legacy-doc` is sael.co's
   * document column — full width below `lg`, three-quarters of the content
   * width from it, capped at `--measure-legacy-doc` — which the legal pages
   * keep at the client's request.
   */
  measure?: 'article' | 'legacy-doc';
  className?: string;
}

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const;

/** "1. Conditions of Use" → "1-conditions-of-use". */
export function proseHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderInline(nodes: readonly ProseInline[]): ReactNode {
  return nodes.map((node, i) => {
    if (typeof node === 'string') return node;
    switch (node.kind) {
      case 'strong':
        return <strong key={i}>{renderInline(node.children)}</strong>;
      case 'em':
        return <em key={i}>{renderInline(node.children)}</em>;
      case 'email':
        return (
          <a
            key={i}
            href={`mailto:${node.address}`}
            // The global ring is 1.84:1 on this ground; white is the dark
            // surfaces' override.
            className="focus-visible:outline-white"
          >
            {node.address}
          </a>
        );
    }
  });
}

/**
 * A long-form document — a legal page, a policy — from a typed structure,
 * never from HTML.
 *
 * **Not the Newsroom's `<NewsArticleBody>`.** That renders sanitised HTML the
 * backend serves; this renders text transcribed into `ProseBlock`s, so there
 * is no markup to sanitise. Both are set by the same `article-prose` utility
 * (globals.css), so a policy and an article read alike.
 *
 * - **The column's width is this component's own** (`measure`), and the
 *   column is centred in whatever it is given. The text inside it stays
 *   left-aligned: a centred paragraph is hard to read past two lines.
 * - **Numbers in the text stay text.** A heading's clause number is part of
 *   its string; an `ordered-list` is a real `<ol>` with the browser's own
 *   decimal numbering, which is what the source's lists use.
 * - **Long words and URLs wrap** (`overflow-wrap: anywhere`), so a phone at
 *   360px never scrolls sideways.
 *
 * A Server Component.
 */
export function LongformProse({ blocks, measure = 'article', className }: LongformProseProps) {
  return (
    <div
      className={cn(
        'mx-auto article-prose w-full text-body text-pretty wrap-anywhere text-body-on-dark',
        measure === 'article'
          ? 'max-w-(--measure-article)'
          : 'max-w-(--measure-legacy-doc) lg:w-3/4',
        className,
      )}
    >
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'heading': {
            const Tag = HEADING_TAG[block.level];
            return (
              <Tag key={i} id={proseHeadingId(block.text)}>
                {block.text}
              </Tag>
            );
          }
          case 'paragraph':
            return <p key={i}>{renderInline(block.children)}</p>;
          case 'ordered-list':
            return (
              <ol key={i} className="list-decimal">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case 'unordered-list':
            return (
              <ul key={i} className="list-disc">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}
