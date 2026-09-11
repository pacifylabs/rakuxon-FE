import { BookOpen, GraduationCap, Landmark } from 'lucide-react';

const SECTIONS = [
  {
    href: '/dashboard/catalogue/institutions',
    icon: Landmark,
    title: 'Institutions',
    description: 'Universities and colleges in the catalogue.',
  },
  {
    href: '/dashboard/catalogue/courses',
    icon: GraduationCap,
    title: 'Courses',
    description: 'Programmes offered at each institution.',
  },
  {
    href: '/dashboard/catalogue/articles',
    icon: BookOpen,
    title: 'Articles',
    description: 'Guidance content shown on the marketing site.',
  },
];

export default function CataloguePage() {
  return (
    <section aria-labelledby="catalogue-heading">
      <h1 id="catalogue-heading" className="font-heading text-3xl font-bold text-text">
        Catalogue
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Publish, suspend, or revert a record, and edit every field it carries — fees, intakes,
        requirements and the rest.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <li key={section.href}>
            <a
              href={section.href}
              className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:bg-surface-muted"
            >
              <span className="grid size-10 place-items-center rounded-md bg-accent-soft text-primary">
                <section.icon aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-4 font-heading text-base font-semibold text-text">{section.title}</p>
              <p className="mt-1 text-sm text-text-muted">{section.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
