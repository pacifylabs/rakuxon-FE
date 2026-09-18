'use client';

import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField } from '@rakuxon/ui';
import type { AdminSiteSettings } from '@rakuxon/contract';

import { ImageUploadField } from '@/components/dashboard/ImageUploadField';
import { RepeatableGroup } from '@/components/dashboard/editors/RepeatableGroup';
import { StringArrayEditor } from '@/components/dashboard/editors/StringArrayEditor';
import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

interface Address {
  label: string;
  lines: string[];
}

interface Social {
  label: string;
  href: string;
}

interface FormState {
  contactEmail: string;
  contactPhones: string[];
  contactAddresses: Address[];
  socials: Social[];
  footerTagline: string;
  footerBlurb: string;
  logoUrl: string;
  logoDarkUrl: string;
}

function fromSettings(settings: AdminSiteSettings): FormState {
  return {
    contactEmail: settings.contactEmail,
    contactPhones: settings.contactPhones,
    contactAddresses: settings.contactAddresses,
    socials: settings.socials,
    footerTagline: settings.footerTagline,
    footerBlurb: settings.footerBlurb,
    logoUrl: settings.logoUrl,
    logoDarkUrl: settings.logoDarkUrl,
  };
}

function SiteSettingsEditor() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('content.manage');

  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      setForm(fromSettings(await client.getSiteSettings()));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load site settings. Please try again.',
      );
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const updated = await client.updateSiteSettings(form);
      setForm(fromSettings(updated));
      setSaved(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save site settings. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return (
      <p role="status" className="text-base text-text-muted">
        {error ?? 'Loading…'}
      </p>
    );
  }

  return (
    <section aria-labelledby="site-settings-heading">
      <h1 id="site-settings-heading" className="font-heading text-3xl font-bold text-text">
        Site settings
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Contact details, social links, footer copy and the brand logo — shown on every page of the
        public site. There is only one of these; changes here go live directly.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-2xl flex-col gap-8">
        {/* A content.view-only admin sees these fields but cannot change them —
            one disabled fieldset covers every control below without repeating
            `disabled` on each one. */}
        <fieldset disabled={!canManage} className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-6">
            <legend className="mb-1 text-lg font-semibold text-text">Contact</legend>

            <FormField
              label="Enquiry email"
              name="contactEmail"
              type="email"
              defaultValue={form.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
              required
            />

            <StringArrayEditor
              label="Phone numbers"
              values={form.contactPhones}
              onChange={(values) => set('contactPhones', values)}
              placeholder="+44 000 000 0000"
            />

            <RepeatableGroup<Address>
              label="Office addresses"
              items={form.contactAddresses}
              onChange={(items) => set('contactAddresses', items)}
              createBlank={() => ({ label: '', lines: [] })}
              renderRow={(item, update) => (
                <div className="flex flex-col gap-3">
                  <input
                    value={item.label}
                    onChange={(e) => update({ label: e.target.value })}
                    placeholder="e.g. UK office"
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                  />
                  <StringArrayEditor
                    label="Address lines"
                    values={item.lines}
                    onChange={(lines) => update({ lines })}
                    placeholder="e.g. Phelp Street, London SE17 2PJ"
                  />
                </div>
              )}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-6">
            <legend className="mb-1 text-lg font-semibold text-text">Social links</legend>

            <RepeatableGroup<Social>
              label="Socials"
              items={form.socials}
              onChange={(items) => set('socials', items)}
              createBlank={() => ({ label: '', href: '' })}
              renderRow={(item, update) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={item.label}
                    onChange={(e) => update({ label: e.target.value })}
                    placeholder="e.g. Instagram"
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                  />
                  <input
                    value={item.href}
                    onChange={(e) => update({ href: e.target.value })}
                    placeholder="https://…"
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                  />
                </div>
              )}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-6">
            <legend className="mb-1 text-lg font-semibold text-text">Footer</legend>

            <FormField
              label="Tagline"
              name="footerTagline"
              defaultValue={form.footerTagline}
              onChange={(e) => set('footerTagline', e.target.value)}
              required
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="footerBlurb" className="text-sm font-medium text-text">
                Blurb
              </label>
              <textarea
                id="footerBlurb"
                value={form.footerBlurb}
                onChange={(event) => set('footerBlurb', event.target.value)}
                rows={3}
                required
                className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-6">
            <legend className="mb-1 text-lg font-semibold text-text">Brand logo</legend>

            <ImageUploadField
              label="Logo (light backgrounds)"
              folder="site-settings"
              value={form.logoUrl}
              onChange={(url) => set('logoUrl', url)}
            />
            <ImageUploadField
              label="Logo (dark backgrounds)"
              folder="site-settings"
              value={form.logoDarkUrl}
              onChange={(url) => set('logoDarkUrl', url)}
            />
          </fieldset>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {saved && !error && (
          <p role="status" className="text-sm text-primary">
            Saved.
          </p>
        )}

        {canManage && (
          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="lg" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}

export default function SiteSettingsPage() {
  return (
    <RequirePermission
      permissions={['content.view']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to view content.
        </p>
      }
    >
      <SiteSettingsEditor />
    </RequirePermission>
  );
}
