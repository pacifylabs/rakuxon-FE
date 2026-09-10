import { CountryFlag } from '@rakuxon/ui';
import type { ArticleSummary } from '@rakuxon/contract';

import { ROUTES, articleRoute } from '@/content/routes';

export function LatestArticles({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-lg font-semibold text-text">Latest guidance</h2>
        <a href={ROUTES.resources} className="text-sm font-semibold text-primary underline">
          See all
        </a>
      </div>

      <ul className="mt-4 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <li key={article.id} className="h-full">
            <a
              href={articleRoute(article.slug)}
              className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 shadow-sm transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span className="flex items-center gap-2 text-sm text-text-muted">
                {article.countryCode && <CountryFlag countryCode={article.countryCode} size="sm" />}
                {article.readMinutes ? `${article.readMinutes} min read` : 'Guidance'}
              </span>

              <h3 className="mt-3 font-heading text-base font-semibold text-text">
                {article.title}
              </h3>

              {article.excerpt && (
                <p className="mt-2 flex-1 text-sm text-text-muted">{article.excerpt}</p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
