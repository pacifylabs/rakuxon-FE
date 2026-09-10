import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Breadcrumbs, CountryFlag, CtaBand, SectionBand } from '@rakuxon/ui';

import { ARTICLE_CTA } from '@/content/resources';
import { ROUTES, articleRoute } from '@/content/routes';
import { fetchArticle, fetchArticles } from '@/lib/catalogue/api';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

/**
 * Pre-render the published set at build time; anything published afterwards is
 * rendered on first request and then cached, rather than 404ing until the next
 * deploy.
 */
export async function generateStaticParams() {
  const { items } = await fetchArticles({ limit: 50 });
  return items.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = await fetchArticle((await params).slug);
  if (!article) return { title: 'Guidance' };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
    },
  };
}

/** Stable id for a heading, so the contents rail can link to it. */
const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * The article's own section headings, read straight out of the markdown.
 *
 * Cheaper and more honest than a second field an editor has to keep in sync:
 * the rail cannot drift from the article because it is derived from it. Only
 * `##` — `###` is detail within a section, and a two-level rail on a
 * seven-minute read is a navigation problem, not navigation.
 */
const outline = (body: string): { id: string; label: string }[] =>
  [...body.matchAll(/^## +(.+)$/gm)]
    .map((match) => (match[1] ?? '').trim())
    .filter(Boolean)
    .map((label) => ({ id: headingId(label), label }));

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) notFound();

  /* Related reading from the same destination where there is one, otherwise
     the same tag. Fetched with a small limit and filtered rather than queried
     per-article: three suggestions do not justify an endpoint. */
  const related = await fetchArticles(
    article.countryCode ? { country: article.countryCode, limit: 4 } : { tag: article.tags[0], limit: 4 },
  );

  const others = related.items.filter((entry) => entry.slug !== article.slug).slice(0, 3);
  const published = formatDate(article.publishedAt);
  const sections = outline(article.body);

  return (
    <>
      <SectionBand labelledBy="article-heading">
        <Breadcrumbs
          trail={[
            { label: 'Home', href: ROUTES.home },
            { label: 'Guidance', href: ROUTES.resources },
          ]}
          current={article.title}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-text-muted">
          {article.countryCode && <CountryFlag countryCode={article.countryCode} size="sm" />}
          {published && <time dateTime={article.publishedAt}>{published}</time>}
          {article.readMinutes && <span>{article.readMinutes} min read</span>}
          {article.author && <span>{article.author}</span>}
        </div>

        <h1
          id="article-heading"
          className="mt-4 max-w-4xl font-heading text-3xl font-bold text-text sm:text-4xl"
        >
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="mt-4 max-w-4xl text-lg text-text-muted">{article.excerpt}</p>
        )}

        {/*
          react-markdown rather than a hand-written parser or
          dangerouslySetInnerHTML. Bodies come out of a database an editor can
          write to, so the renderer has to be one that cannot emit raw HTML —
          this one does not, by default, and that is the whole reason it is a
          dependency rather than forty lines of regex.

          Element styling is explicit because the preset replaces Tailwind's
          scale; there is no typography plugin to inherit from.
        */}
        {/*
          Two columns rather than a narrow column with an empty half beside it.
          The prose still stops at a readable measure — a 1,200px line is about
          160 characters and the eye loses its place returning to the left — but
          the space that was blank now carries the contents rail, so the page
          uses its width instead of leaving it.
        */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2
                  /* Same derivation as the rail, so every link resolves. */
                  id={headingId(String(children))}
                  className="mt-10 scroll-mt-20 font-heading text-2xl font-bold text-text"
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 font-heading text-xl font-semibold text-text">{children}</h3>
              ),
              p: ({ children }) => <p className="mt-4 text-base text-text">{children}</p>,
              ul: ({ children }) => (
                <ul className="mt-4 flex list-disc flex-col gap-2 pl-6 text-base text-text">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mt-4 flex list-decimal flex-col gap-2 pl-6 text-base text-text">
                  {children}
                </ol>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-text">{children}</strong>
              ),
              blockquote: ({ children }) => (
                <blockquote className="mt-6 border-l-4 border-accent bg-surface-muted px-6 py-4 text-base italic text-text-muted">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="rounded-sm text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                  {...(href?.startsWith('http')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded-sm bg-surface-muted px-1 text-sm text-text">
                  {children}
                </code>
              ),
            }}
          >
            {article.body}
          </Markdown>
          </div>

          {sections.length > 1 && (
            <nav
              aria-labelledby="article-contents-heading"
              className="order-first lg:order-none lg:sticky lg:top-20 lg:self-start"
            >
              <h2
                id="article-contents-heading"
                className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted"
              >
                On this page
              </h2>
              <ol className="mt-4 flex flex-col gap-3 border-l border-border pl-4">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="rounded-sm text-sm text-text-muted transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>

        {article.tags.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2" aria-label="Topics">
            {article.tags.map((tag) => (
              <li key={tag}>
                <a
                  href={`${ROUTES.resources}?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                >
                  {tag.replace(/-/g, ' ')}
                </a>
              </li>
            ))}
          </ul>
        )}
      </SectionBand>

      {others.length > 0 && (
        <SectionBand tone="surface" labelledBy="article-related-heading">
          <h2
            id="article-related-heading"
            className="font-heading text-2xl font-bold text-text"
          >
            Read next
          </h2>

          <ul className="mt-6 grid items-stretch gap-4 sm:grid-cols-3">
            {others.map((entry) => (
              <li key={entry.id} className="h-full">
                <a
                  href={articleRoute(entry.slug)}
                  className="flex h-full flex-col rounded-lg border border-border bg-bg p-6 transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <h3 className="font-heading text-base font-semibold text-text">{entry.title}</h3>
                  {entry.excerpt && (
                    <p className="mt-2 flex-1 text-sm text-text-muted">{entry.excerpt}</p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </SectionBand>
      )}

      <SectionBand labelledBy="article-cta-heading">
        <CtaBand
          headingId="article-cta-heading"
          heading={ARTICLE_CTA.heading}
          subline={ARTICLE_CTA.subline}
          cta={ARTICLE_CTA.cta}
          reassurance={ARTICLE_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
