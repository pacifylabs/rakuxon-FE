# Rakuxon — Multi-Page Marketing Site Design Spec
**Repo:** `rakuxon-FE` → `apps/base-site` · Companion to `04a-landing-and-design-system.md` (tokens) and `04-design-system.md` (architecture). **Date:** August 2026

> A **multi-page marketing site**, framed on how **Edvoy** and **ApplyBoard** structure their sites (both researched directly), with the **Home page following the ScholarPath reference** near-1:1 on structure (see §3 and the reference mapping in §14). Every image slot names a **real, hotlink-permitted Unsplash/Pexels URL** with alt text — no placeholders, no reuse. Direction stays calm/trust-forward per `04a` — the **Modern Campus** palette: deep forest green primary, sage-grey surfaces, electric sky-blue accent. The amber-orange `--tint-urgent` is used only as an urgency/deadline accent.
>
> **Image note:** URLs use Unsplash's stable `images.unsplash.com/photo-{id}` hotlink form (hotlinking permitted under the Unsplash license). I could not fetch them from the build sandbox (egress blocks image domains), so **verify each on first load and swap any that 403** — the search term is given beside each so a replacement takes seconds. For production, consider pulling these into your own Cloudinary once (you already run it) so they never depend on an external host.

---

## 1. Site map (multi-page)

Framed on Edvoy + ApplyBoard. Pages:

```
/                     Home
/students             For Students
/agencies             For Agencies / Recruitment Partners
/institutions         For Institutions / Universities
/universities         Explore Universities (catalogue browse)
/destinations         Study Destinations (index)
/destinations/[country]  Per-country page (UK, Canada, US, Ireland, Australia, Germany …)
/about                About
/contact              Contact
/resources            Resources / Blog index   (optional phase-2)
/login  /register     (hand off to the product apps)
```

Both references converge on this: a home page plus dedicated audience pages (students / agents / institutions), destination pages, about, and contact. We mirror that.

---

## 2. Global shell (every page)

### Header (sticky, translucent-on-scroll)
- Left: **Rakuxon** wordmark (Rakuxon forest green + Path sky-blue accent), beside the doorway mark.
- Nav: *Students · Agencies · Institutions · Universities · Destinations · About*.
- Right: **Log in** (ghost) + **Get started** (primary).

### Footer (every page)
Four columns — *Get to know us* (About, How we work, Contact, Careers), *For* (Students, Agencies, Institutions), *Destinations* (country links), *Legal* (Privacy, Terms) — plus wordmark, socials, copyright. Legal links matter: this is a document-handling product.

### Tokens
All colors/space/type from `04a` base theme. Nothing hard-coded.

---

## 3. HOME — `/`  *(structural blueprint: the ScholarPath reference)*

The Home page follows the **ScholarPath layout near-1:1 on structure** — proven, calm, trust-forward — with our study-abroad content and our three-sided platform. Forest-green primary, sky-blue accent; the amber `urgent` tint strictly for urgency/deadlines. Section order below matches the reference top-to-bottom, then continues with our multi-page sections (destinations, testimonials, three-audience split).

### 3.1 Hero  *(match reference closely)*
Two-column. **Left column:**
- **Eyebrow pill** on `--color-accent-soft`: *"YOUR JOURNEY STARTS HERE"* (uppercase, small, primary text).
- **H1, two lines**, second line in the forest-green primary: *"Study abroad."* / *"Simplified."* (or *"Your dream university. / Within reach."*).
- **Subcopy** (2–3 lines): *Research, plan, apply, and track your international education — all in one place. Apply with confidence and turn your goals into offers.*
- **Two CTAs:** **Get started** (solid primary) + **How it works** (ghost, with a small play-circle icon) — exactly the reference pairing.
- **Social-proof row:** 3 stacked overlapping avatar faces + *"Join 100,000+ students who found their path."*
  - avatar 1 `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80` alt: "Student"
  - avatar 2 `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80` alt: "Student"
  - avatar 3 `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80` alt: "Student"

**Right column — hero figure + floating live-data cards + icon bubbles** (the detail that makes it read as a real product):
- **[HERO figure]** a confident student, cut-out feel, holding books / smiling:
  `https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80`
  alt: "Smiling student ready to study abroad"
  *(search: "happy student books")* — soft sage/accent blob shape behind it (CSS, not an image).
- **Floating card A — "Match Score"** (top-right): a circular progress ring showing e.g. *92%* + *"Great match!"* + *"View details →"*. White surface, `--shadow-md`, `--radius-lg`.
- **Floating card B — "Application Deadline"** (lower-right): *"18 Days Left"* in the **orange accent** + *"University of Toronto"* + *"View program →"*.
- **Two small icon bubbles** overlapping the figure (reference detail): a graduation-cap bubble and a dollar/scholarship bubble — soft accent circle + primary icon.

*(These cards are static, illustrative UI — real numbers come later. Mark them clearly as sample data in code.)*

### 3.2 Trust logo bar  *(reference: the white card straddling hero + next section)*
Full-width white card with soft shadow, slightly overlapping the hero bottom. Centered label *"Trusted by students and partners worldwide"* + a row of 5–6 institution/partner logos (greyscale).
- Use real university/partner wordmarks only where you have permission; until then, use neutral placeholder logo marks **clearly flagged in code** (this is the one spot where real photos don't apply — logos, not photography).

### 3.3 "Everything you need" — capability grid  *(reference: the 4-card grid)*
Centered eyebrow *"EVERYTHING YOU NEED"* + H2 *"Your study abroad journey, simplified."* Then a **4-card grid**, each card = soft-tinted icon square + title + 2-line description + text link (accent, with arrow):
1. **Search & Match** — *Find programs and universities that fit your profile, goals, and budget.* → *Search now →*
2. **Prepare & Apply** — *Build your profile, upload documents, and apply with confidence.* → *Start applying →*
3. **Stay Organized** — *Track deadlines and get reminders so you never miss a step.* → *Get organized →*
4. **Track & Achieve** — *Follow your admission status in real time, all the way to your offer.* → *Track status →*

Each icon square uses a different soft tint (`tone1` forest / `tone2` sky / `tone4` slate, with `urgent` amber on **Stay Organized** only, since that card is about deadlines) — matching the reference's coloured icon squares. Tint names are slot-based, not hue-based; see `04a` § 3.1.

### 3.4 Stat bar  *(reference: 4 stats with colored icon chips)*
A soft-surface band, four stats each with a colored icon chip:
- 100,000+ **Students guided** (`tone1`, people icon)
- 1,500+ **Universities** (`tone2`, check/institution icon)
- 1,200+ **Partner agencies** (`tone3`, building icon)
- 150+ **Countries supported** (`tone4`, globe icon)

**Not** the amber `urgent` tint anywhere in this bar: partner agencies is not a deadline, and spending the urgency colour on decoration destroys its signal.

*(Numbers are placeholders until real — clearly marked in code.)*

### 3.5 How it works (3 steps)
**1. Build your profile → 2. Shortlist & apply → 3. Track your admission.** Icon + line each. Mirrors the real product flow. (Kept from our spec; sits well after the stat bar.)

### 3.6 Popular destinations (grid of country cards)
Six cards, each a real destination photo + country name → links to `/destinations/[country]`.
- **UK** `https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80` alt: "London skyline with Big Ben" *(search: "london uk")*
- **Canada** `https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&q=80` alt: "Toronto city skyline" *(search: "toronto canada")*
- **USA** `https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&q=80` alt: "New York City street" *(search: "new york city")*
- **Ireland** `https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&q=80` alt: "Dublin street and architecture" *(search: "dublin ireland")*
- **Australia** `https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80` alt: "Sydney Opera House and harbour" *(search: "sydney australia")*
- **Germany** `https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80` alt: "Berlin cityscape" *(search: "berlin germany")*

### 3.7 Meet the institutions (campus cards row)
"Explore leading institutions." A scroll row of university cards (campus photo + name). Use real campus photos:
- `https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80` alt: "University campus building" *(search: "university campus")*
- `https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80` alt: "Historic university hall" *(search: "university hall")*
- `https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800&q=80` alt: "Modern campus courtyard" *(search: "campus courtyard")*

### 3.8 Testimonials
2–3 student quotes with a real face photo each:
- `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80` alt: "Portrait of a smiling student" *(search: "student portrait woman")*
- `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80` alt: "Portrait of a smiling student" *(search: "student portrait man")*

### 3.9 Three-audience split — "Start your journey with us"
Three cards (Edvoy's exact pattern), each a real image + CTA:
- **Students** → *Sign up*
  `https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80` alt: "Group of students together on campus" *(search: "happy students group")*
- **Agencies** → *Become a partner*
  `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80` alt: "Advisor meeting with a client at a desk" *(search: "business advisor meeting")*
- **Institutions** → *Partner with us*
  `https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80` alt: "University lecture hall with students" *(search: "university lecture hall")*

### 3.10 Closing CTA band  *(reference: bold deep-colour block)*
Full-width **deep forest green** block (`--color-primary`), rounded, with a graduation-cap icon bubble on the left, headline *"Ready to start your journey?"* + subline *"Join thousands of students turning their dream into an offer."*, and a **white** CTA button *"Create free account"* on the right. Reassurance line beneath the button: *"No credit card required."* High contrast, white text on forest green (12.2:1) — the one bold moment on an otherwise calm page.

---

## 4. FOR STUDENTS — `/students`

### 4.1 Hero (image left or right)
H1 *"Find your perfect program — and get in."* subcopy about guided applications, quality checks. CTA **Create a student account**.
- **[HERO]** `https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1400&q=80` alt: "Students studying together at a table" *(search: "students studying table")*

### 4.2 Value props (3–4 with icons)
*Apply to multiple programs at once · Higher success with AI document checks · Track admission in real time · Scholarship & budget guidance.*

### 4.3 Product preview
A clean shot representing the student app (upload center / tracker). Use a device/desk photo:
- `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80` alt: "Laptop showing a dashboard on a desk" *(search: "laptop dashboard desk")*

### 4.4 How it works for students (stepper)
Profile → upload documents → shortlist → apply → track.

### 4.5 Student testimonials + CTA band (reuse pattern, new faces)
- `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80` alt: "Portrait of a student outdoors" *(search: "young man portrait")*
- `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80` alt: "Portrait of a smiling young woman" *(search: "young woman portrait")*

---

## 5. FOR AGENCIES — `/agencies`

### 5.1 Hero
H1 *"Grow your recruitment business — no platform fees."* (Edvoy's "no platform fee" wedge). CTA **Become a partner**.
- **[HERO]** `https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1400&q=80` alt: "Team collaborating in a bright office" *(search: "team office collaboration")*

### 5.2 How we help (value props)
*Manage all your students in one place · Review documents with AI checks · Onboard students via one link · Transparent commissions · Training & support.*

### 5.3 Partner workflow preview
- `https://images.unsplash.com/photo-1552581234-26160f608093?w=1200&q=80` alt: "Two colleagues reviewing work on a screen" *(search: "colleagues reviewing screen")*

### 5.4 Commission/benefits strip + CTA
Icon list of partner benefits; CTA **Join our network**.

---

## 6. FOR INSTITUTIONS — `/institutions`

### 6.1 Hero
H1 *"Reach qualified students, worldwide."* CTA **Partner with us**.
- **[HERO]** `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=80` alt: "University graduates at commencement" *(search: "university graduation")*

### 6.2 How we help institutions
*Diversify enrolment across nationalities · Higher-quality applications · Reduce manual processing · Reliable partner network.* (ApplyBoard's institution pitch.)

### 6.3 Trust + campus imagery
- `https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80` alt: "Students walking on a university campus" *(search: "campus students walking")*

### 6.4 CTA band → **Become a partner institution**.

---

## 7. EXPLORE UNIVERSITIES — `/universities`

Marketing-side browse (real catalogue lives in the product). Filter bar (country, level, subject) + a grid of university cards (campus photo + name + country + "View"). Real campus photos per card, e.g.:
- `https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&q=80` alt: "University library interior" *(search: "university library")*
- `https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=800&q=80` alt: "College campus green" *(search: "college campus green")*
- `https://images.unsplash.com/photo-1622397333309-3056849bc70b?w=800&q=80` alt: "Campus building exterior" *(search: "campus building")*

---

## 8. DESTINATIONS — `/destinations` + `/destinations/[country]`

### 8.1 Index `/destinations`
Grid of country cards (reuse the six destination photos from Home §3.4, but these are the canonical destination entries — each links to its country page).

### 8.2 Country page `/destinations/[country]` (template)
- **Hero:** country landmark photo + "Study in {Country}".
- Sections: why study here · popular universities (cards) · typical costs · intakes · how Rakuxon helps · CTA.
- Landmark hero examples: UK/Canada/US/Ireland/Australia/Germany use the §3.4 URLs at `?w=1400`.

---

## 9. ABOUT — `/about`

- Hero: mission statement + a warm team/office photo.
  `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80` alt: "Team working together in an office" *(search: "team working office")*
- Sections: our story · how we work (the 3-surface model in plain language) · values (trust, transparency, guidance) · stats · CTA.

---

## 10. CONTACT — `/contact`

- Split layout: left = contact form (name, email, role [student/agency/institution], message); right = supporting image + details (email, socials, office).
  `https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80` alt: "People collaborating at a table" *(search: "contact team table")*
- Form posts to the BE contact/intake endpoint. No product auth here.

---

## 11. Components (→ `packages/ui`, reused across pages)

Header, Footer, Button (primary/ghost/accent), Wordmark, SectionBand, StepItem, TrustBadge, **DestinationCard** (image+name), **UniversityCard** (image+name+country), **TestimonialCard** (quote+face), **AudienceCard** (image+title+CTA), **ImageHero** (image + headline block), **ContactForm**.

Reference-derived (ScholarPath) components:
- **EyebrowPill** — small uppercase accent-soft pill above headings.
- **HeroFloatingCard** — the "Match Score" (with a **ProgressRing**) and "Application Deadline" live-data cards; white surface, soft shadow, rounded.
- **IconBubble** — soft tinted circle + matching tint icon (hero bubbles + stat chips).
- **CapabilityCard** — tinted icon square + title + description + arrow text-link (the 4-card grid).
- **StatChip** — colored icon chip + big number + label (the stat bar).
- **AvatarStack** — overlapping avatar faces for social proof.
- **LogoBar** — greyscale partner-logo row in a floating white card.
- **CtaBand** — the bold deep forest-green closing block with white button.

Each token-styled, a11y-complete, TDD (Vitest + RTL).

---

## 12. Image handling rules

- **Format:** Unsplash `images.unsplash.com/photo-{id}?w={width}&q=80` (hotlink form). Pexels equivalent acceptable.
- **Every slot has its own image** — no reuse across different meanings (destination photos may recur only as the same canonical destination entry).
- **Alt text is mandatory** (given per slot above) — a11y + SEO.
- **Next/Image:** add `images.unsplash.com` (and `images.pexels.com`) to `next.config` `remotePatterns`.
- **Responsive:** request smaller widths on mobile (`?w=800`) vs hero (`?w=1400`); use `sizes`.
- **Verify on first load; swap any 403 using the given search term.** Optionally re-host in Cloudinary for permanence.
- **Performance:** lazy-load below-the-fold; hero eager. `q=80` balances weight/quality.

---

## 13. Build order (when we code)

1. `next.config` remotePatterns + tokens wired from `04a`.
2. Global shell (Header/Footer) with tests.
3. Shared cards (Feature/Destination/University/Testimonial/Audience/ImageHero).
4. Home page section by section (real images in).
5. Students → Agencies → Institutions (audience pages share components).
6. Universities + Destinations (index + country template).
7. About + Contact.
8. Responsive + a11y pass; verify every image loads; swap any 403s.

TDD throughout: each component test-first; a per-page smoke test asserts sections render with correct headings, landmarks, and that every `<img>`/`next/image` has non-empty alt.

---

## 14. Reference mapping (ScholarPath → Rakuxon Home)

The Home page (§3) follows the ScholarPath reference near-1:1 on **structure**, with our content and one accent-discipline rule (forest-green primary, sky-blue accent; the amber `urgent` tint only for urgency/deadlines):

| ScholarPath element | Rakuxon Home section | Component |
|---|---|---|
| Eyebrow pill + 2-line accent H1 + dual CTA + avatar social proof | §3.1 Hero left | EyebrowPill, Button, AvatarStack |
| Hero figure + "Match Score" ring + "Deadline" card + icon bubbles | §3.1 Hero right | HeroFloatingCard, ProgressRing, IconBubble |
| Trust logo bar (white card straddling hero) | §3.2 | LogoBar |
| "Everything you need" 4-card grid | §3.3 | CapabilityCard |
| Stat bar with colored icon chips | §3.4 | StatChip |
| Bold forest-green CTA band + "no credit card required" | §3.10 | CtaBand |
| Multi-column footer | Global footer | Footer |

We **kept** from our own spec (not in ScholarPath) the destinations grid, campus/institution cards, testimonials with faces, and the three-audience split — because those carry the study-abroad, three-sided story ScholarPath (scholarships-only) doesn't.

## 15. What changed across versions

- **v1 single page → v2 multi-page** site map (Home + Students + Agencies + Institutions + Universities + Destinations + About + Contact), framed on Edvoy/ApplyBoard.
- **v2 → v3 (this):** Home page restructured to the **ScholarPath blueprint** (hero with live-data floating cards, trust logo bar, 4-card capability grid, stat bar, bold primary-colour CTA band); added the reference-derived components; kept our domain sections below.
- **Real, per-slot images** with URLs + alt text, no reuse (unchanged).
- **v3 → v4:** palette retuned to the **Modern Campus** direction (deep forest green / sage / electric sky blue) in `04a` § 3.1. Structure, sections and imagery are unchanged; only colour tokens moved. The categorical tint set gained slot-based names (`tone1`–`tone4`) plus a semantic `urgent`, and `--color-success` / `--color-info` were retuned to stay distinct from the new primary and accent.