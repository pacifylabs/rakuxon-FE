'use client';

import { ClipboardList, FileCheck, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useApiClient, useAuth } from '@rakuxon/auth';
import { StatChip } from '@rakuxon/ui';
import type {
  Application,
  ArticleSummary,
  CountryCount,
  StudentDocument,
  StudentProfile,
} from '@rakuxon/contract';

import { profileCompleteness } from '@/components/dashboard/profile/completeness';
import { DOCUMENT_TYPES } from '@/components/dashboard/documentTypes';
import { ExploreDestinations } from '@/components/dashboard/home/ExploreDestinations';
import { LatestArticles } from '@/components/dashboard/home/LatestArticles';

/**
 * Loaded best-effort: three independent calls, each rendering its own stat
 * when it resolves. One failing must not blank the other two, so each is
 * caught on its own rather than behind one Promise.all — logged, not thrown,
 * since a stat that fails to load is a degraded home page, not a broken one.
 */
function useDashboardStats() {
  const client = useApiClient();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const value = await client.getMyProfile();
        if (!cancelled) setProfile(value);
      } catch (error) {
        console.error('[dashboard] profile stat failed to load:', error);
      }
    })();

    void (async () => {
      try {
        const value = await client.listDocuments();
        if (!cancelled) setDocuments(value);
      } catch (error) {
        console.error('[dashboard] documents stat failed to load:', error);
      }
    })();

    void (async () => {
      try {
        const value = await client.listApplications();
        if (!cancelled) setApplications(value);
      } catch (error) {
        console.error('[dashboard] applications stat failed to load:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client]);

  return { profile, documents, applications };
}

/**
 * The catalogue teasers — destinations and guidance — are public data with
 * no per-user shape, so they are fetched the same best-effort way as the
 * stats above: independently, logged rather than thrown on failure, so a
 * catalogue hiccup degrades the home page instead of breaking it.
 */
function useDashboardDiscover() {
  const client = useApiClient();
  const [destinations, setDestinations] = useState<CountryCount[] | null>(null);
  const [articles, setArticles] = useState<ArticleSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const value = await client.listDestinationCounts();
        if (!cancelled) setDestinations(value);
      } catch (error) {
        console.error('[dashboard] destinations failed to load:', error);
      }
    })();

    void (async () => {
      try {
        const value = await client.listArticles(3);
        if (!cancelled) setArticles(value.items);
      } catch (error) {
        console.error('[dashboard] articles failed to load:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client]);

  return { destinations, articles };
}

/** Auth and the sidebar shell live in layout.tsx; this is just the Home panel. */
export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName;
  const { profile, documents, applications } = useDashboardStats();
  const { destinations, articles } = useDashboardDiscover();

  const uploadedCount = documents?.filter((document) => document.status === 'uploaded').length;
  const submittedCount = applications?.filter((application) => application.status === 'submitted').length;

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="font-heading text-3xl font-bold text-text">
        {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Complete your profile, upload your documents and track your applications from here.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6 rounded-lg border border-border bg-surface p-6 sm:grid-cols-3">
        <StatChip
          icon={UserCheck}
          tone="tone1"
          value={profile ? `${profileCompleteness(profile)}%` : '—'}
          label="Profile complete"
        />
        <StatChip
          icon={FileCheck}
          tone="tone2"
          value={documents ? `${uploadedCount}/${DOCUMENT_TYPES.length}` : '—'}
          label="Documents uploaded"
        />
        <StatChip
          icon={ClipboardList}
          tone="tone3"
          value={applications ? String(applications.length) : '—'}
          label={
            applications
              ? `Application${applications.length === 1 ? '' : 's'}${
                  submittedCount ? ` (${submittedCount} submitted)` : ''
                }`
              : 'Applications'
          }
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            href: '/dashboard/profile',
            title: 'Complete your profile',
            body: 'The details admissions teams need to process your application.',
          },
          {
            href: '/dashboard/documents',
            title: 'Upload documents',
            body: 'Transcripts, English test results and identification.',
          },
          {
            href: '/dashboard/applications',
            title: 'Track applications',
            body: 'See where each application stands, start to finish.',
          },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
          >
            <h2 className="font-heading text-base font-semibold text-text">{card.title}</h2>
            <p className="mt-2 text-sm text-text-muted">{card.body}</p>
          </a>
        ))}
      </div>

      {destinations && destinations.length > 0 && (
        <div className="mt-12">
          <ExploreDestinations destinations={destinations} />
        </div>
      )}

      {articles && articles.length > 0 && (
        <div className="mt-12">
          <LatestArticles articles={articles} />
        </div>
      )}
    </section>
  );
}
