# Rakuxon — Multi-Page Marketing Site Design Spec
**Repo:** `rakuxon-FE` → `apps/base-site` · Companion to `04a-landing-and-design-system.md` (tokens) and `04-design-system.md` (architecture). **Date:** August 2026

> **Plan revision — real brand content.** This site is now the public face of
> **Rakuxon Ltd**, an existing education consultancy (HQ London, operations in
> Nigeria, Ghana, Kenya and Qatar). Tagline: **"Where Minds Meet Maps."** The
> placeholder statistics, invented testimonials and generic copy in earlier
> versions are **replaced by the real content in §0** — that section is the
> source of truth and overrides any conflicting copy below. Two structural
> additions: `/services` and `/success-stories` (§16, §17), and a live typeahead
> search feeding university/course detail pages (§18).
>
> A **multi-page marketing site**, framed on how **Edvoy** and **ApplyBoard** structure their sites (both researched directly), with the **Home page following the ScholarPath reference** near-1:1 on structure (see §3 and the reference mapping in §14). Every image slot names a **real, hotlink-permitted Unsplash/Pexels URL** with alt text — no placeholders, no reuse. Direction stays calm/trust-forward per `04a` — the **Modern Campus** palette: deep forest green primary, sage-grey surfaces, electric sky-blue accent. The amber-orange `--tint-urgent` is used only as an urgency/deadline accent.
>
> **Image note:** URLs use Unsplash's stable `images.unsplash.com/photo-{id}` hotlink form (hotlinking permitted under the Unsplash license). I could not fetch them from the build sandbox (egress blocks image domains), so **verify each on first load and swap any that 403** — the search term is given beside each so a replacement takes seconds. For production, consider pulling these into your own Cloudinary once (you already run it) so they never depend on an external host.

---

## 0. Real brand content (source of truth)

Taken from rakuxon.com. **Where anything below conflicts with a later section, this wins.**

### Identity
- **Name:** Rakuxon Ltd
- **Tagline:** *Where Minds Meet Maps.*
- **Positioning:** a global education consultancy — study-abroad advice, applications, visas and travel — now with a platform behind it.
- **HQ:** London, UK. **Operations:** Nigeria, Ghana, Kenya, Qatar.

> The previous tagline *"From ambition to admission."* is retired. It is currently
> hard-coded as `brand.tagline` in `packages/ui/src/theme/tokens.base.ts`, so this
> is a **code change**, not just copy: the token changes, and every surface picks
> it up.

### Vision *(verbatim)*
> "To become the premier global bridge connecting dreams with destinations, empowering individuals to explore, learn, and achieve without limits."

### Mission *(verbatim)*
> "To deliver trusted, personalized, and innovative educational consultancy and travel services, transforming aspirations into achievements through expert guidance, exceptional service, and unwavering commitment to client success."

### Services (six — drive `/services` and the Home services grid)

| Service | One-line description |
|---|---|
| **Free Educational Consultancy** | Complimentary expert guidance for university and course selection aligned with academic and career goals. |
| **University Selection & Application** | Support selecting institutions and managing the entire application process. |
| **Visa Application Support** | Assistance with documentation, interview preparation and submission. |
| **Travels & Tourism** | Flight booking, hotel reservations and vacation planning packages. |
| **Pre-departure & Arrival Support** | Accommodation, airport transfers, job guidance and cultural orientation. |
| **Ongoing Client Support** | Continuous assistance throughout the academic and travel journey. |

### Statistics — **real, not placeholders**

| Number | Label |
|---|---|
| **2,500+** | Students & Travelers |
| **200+** | Partner Universities |
| **11+** | Years Experience |
| **95%** | Success Rate |

> These replace the invented "100,000+ students / 1,500+ universities" figures.
> **Remove the placeholder flags in code** — these are real and attributable.
>
> **One caveat to resolve before launch:** "200+ Partner Universities" is
> Rakuxon Ltd's consultancy figure. The platform catalogue (`10-catalogue-data.md`)
> will list far more institutions than Rakuxon has partnerships with, so the two
> numbers mean different things and must not be presented as one. Label this stat
> *"Partner universities"* and any catalogue count *"Universities in our
> catalogue"*.

### Success stories (six real testimonials)

Sarah Adebayo — Oxford · Michael Okafor — MIT · Fatima Kone — Toronto · Amaka & Chinedu Eze — Dubai · Tomiwa Adedeji — Europe · David Adamu — Cambridge.

Full quote text to be pulled from rakuxon.com at build time and kept verbatim.

> **Consent check.** These are named, identifiable clients attached to named
> universities. They are already published on rakuxon.com, so consent is
> presumed carried over — confirm it covers the new site before launch, and use
> the same names/photos permissions. Do not add a face photo to a testimonial
> unless that person's photo is already published with it; a stock portrait
> standing in for a real named client misrepresents them.

### Contact

- **Email:** enquiries@rakuxon.com
- **Phone:** +234 816 717 8847 · +44 776 094 4935
- **UK office:** Flat 15, St. Matthews House, Phelp Street, London SE17 2PJ
- **Nigeria office:** 11 Akinsemoyin Street, Surulere, Lagos
- **Social:** WhatsApp · Instagram [@rakuxon](https://instagram.com/rakuxon) · TikTok [@rakuxonltd](https://tiktok.com/@rakuxonltd) · X [@rakuxon](https://x.com/rakuxon) · Facebook · YouTube

**Contact routing:** the primary contact form **posts to the BE `POST /v1/contact`
endpoint** (BE `07-api-contract.md`). WhatsApp stays as a secondary CTA button —
the old site's main channel — but is no longer the primary path, because a
WhatsApp deep link leaves no record, no audit trail and no way to route an
enquiry to the right office.

---

## 1. Site map (multi-page)

Framed on Edvoy + ApplyBoard. Pages:

```
/                     Home
/services             Services (the six Rakuxon Ltd services)          ← NEW
/students             For Students
/agencies             For Agencies / Recruitment Partners
/institutions         For Institutions / Universities
/universities         Explore Universities (catalogue browse)
/universities/[slug]  University detail / info page                    ← NEW
/courses/[slug]       Course detail / info page                        ← NEW
/success-stories      Success Stories (the six real testimonials)      ← NEW
/destinations         Study Destinations (index)
/destinations/[country]  Per-country page (UK, Canada, US, Ireland, Australia, Germany …)
/about                About — vision, mission, story, offices
/contact              Contact
/resources            Resources / Blog index   (optional phase-2)
/login  /register     (hand off to the product apps)
```

Both references converge on this: a home page plus dedicated audience pages (students / agents / institutions), destination pages, about, and contact. We mirror that.

---

## 2. Global shell (every page)

### Header (sticky, translucent-on-scroll)
- Left: **Rakuxon** wordmark (Rakuxon forest green + Path sky-blue accent), beside the doorway mark.
- Nav: *Services · Students · Agencies · Institutions · Universities · Destinations · About*.
- **Centre: the live search field** (§18) — present on every page, not just Home. It is the primary way into the catalogue.
- Right: **Log in** (ghost) + **Get started** (primary).

### Footer (every page)
Grid layout (pattern reference: `@Pacifylabs/rakuxon-care`). Columns:

- **Get to know us** — About, Services, Success Stories, Contact
- **For** — Students, Agencies, Institutions
- **Destinations** — country links
- **Legal** — Privacy, Terms, Cookie policy, **Data protection**

Plus a **contact block**: both offices (UK + Nigeria) as real postal addresses, both phone numbers as `tel:` links, enquiries@rakuxon.com as `mailto:`, and the social row (WhatsApp, Instagram, TikTok, X, Facebook, YouTube). Wordmark + tagline *"Where Minds Meet Maps."* + copyright.

Legal links matter more here than on a typical marketing site: this product handles passports, transcripts and financial documents belonging in part to minors, and — per the BE's `09-tenant-isolation.md` §1 — student records are shared across agencies. The privacy notice must say so plainly.

### Tokens
All colors/space/type from `04a` base theme. Nothing hard-coded.

---

## 3. HOME — `/`  *(structural blueprint: the ScholarPath reference)*

The Home page follows the **ScholarPath layout near-1:1 on structure** — proven, calm, trust-forward — with our study-abroad content and our three-sided platform. Forest-green primary, sky-blue accent; the amber `urgent` tint strictly for urgency/deadlines. Section order below matches the reference top-to-bottom, then continues with our multi-page sections (destinations, testimonials, three-audience split).

### 3.1 Hero  *(match reference closely)*
Two-column. **Left column:**
- **Eyebrow pill** on `--color-accent-soft`: *"YOUR JOURNEY STARTS HERE"* (uppercase, small, primary text).
- **H1, two lines**, second line in the forest-green primary: *"Study abroad."* / *"Simplified."* (or *"Your dream university. / Within reach."*).
- **Subcopy** (2–3 lines): *Eleven years guiding students from Lagos, Accra, Nairobi and Doha to universities worldwide — now with the platform to match. Search, apply, and track every step.*
- **Search field** (§18) sits directly beneath the subcopy: the fastest route from landing to a course page.
- **Two CTAs:** **Get started** (solid primary) + **How it works** (ghost, with a small play-circle icon) — exactly the reference pairing.
- **Social-proof row:** 3 stacked overlapping avatar faces + *"Join 2,500+ students and travellers we've guided."* **(§0 — real figure, not a placeholder.)**
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
A soft-surface band, four stats each with a colored icon chip — **the real §0 figures**:
- 2,500+ **Students & travellers** (`tone1`, people icon)
- 200+ **Partner universities** (`tone2`, check/institution icon)
- 11+ **Years experience** (`tone3`, calendar icon)
- 95% **Success rate** (`tone4`, trophy icon)

**Not** the amber `urgent` tint anywhere in this bar: a success rate is not a deadline, and spending the urgency colour on decoration destroys its signal.

Each number animates from 0 on scroll (`CountUp`, already built — it renders the final value in an `sr-only` span so screen readers and no-JS get the real figure immediately, and respects `prefers-reduced-motion`).

**Remove the placeholder markers in code** — these are attributable. "95% success rate" is a public claim, so keep a note of what it measures in case it is ever challenged.

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

### 3.8 Success stories *(real testimonials)*
The auto-playing three-card slider, drawing from the **six real testimonials in §0** — Sarah Adebayo (Oxford), Michael Okafor (MIT), Fatima Kone (Toronto), Amaka & Chinedu Eze (Dubai), Tomiwa Adedeji (Europe), David Adamu (Cambridge). "See all stories →" links to `/success-stories`.

**No stock portraits on these cards.** They are named, identifiable people; attaching a stock face to a real name misrepresents them. Use each person's own photo where rakuxon.com already publishes one, and otherwise a typographic initial avatar — which is honest, and looks deliberate rather than missing.

Slider behaviour is unchanged from the built component: auto-advance, pause on hover and focus, pause on `prefers-reduced-motion`, and visible controls (WCAG 2.2.2 — auto-advancing content must be pausable).

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

- Hero: the **mission statement verbatim** (§0) + a warm team/office photo.
  `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80` alt: "Team working together in an office" *(search: "team working office")*
- Sections:
  - **Vision** and **Mission** — both quoted **verbatim** from §0. Do not paraphrase; these are the company's own words.
  - **Our story** — eleven years, London HQ, operations across Nigeria, Ghana, Kenya and Qatar.
  - **Where we are** — the two offices with real addresses, and the four operating countries.
  - **How we work** — the three-surface model in plain language.
  - **Values** — trust, transparency, guidance.
  - **Stats** — the four real §0 figures.
  - CTA band.

---

## 10. CONTACT — `/contact`

- Split layout: left = contact form; right = supporting image + the real §0 details.
  `https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80` alt: "People collaborating at a table" *(search: "contact team table")*
- **Form fields:** name, email, phone (optional), role (student / agency / institution / traveller), service of interest (the six from §0), message. Posts to **`POST /v1/contact`** on the BE. No product auth.
- **WhatsApp stays as a secondary CTA** — a prominent "Chat on WhatsApp" button beside the form, not instead of it. The form is primary because a WhatsApp link leaves no record and cannot be routed to the right office.
- **Both offices shown** with full postal addresses, both phone numbers as `tel:` links, enquiries@rakuxon.com as `mailto:`, and the full social row.
- **Honeypot field** (visually hidden, `tabindex="-1"`, `autocomplete="off"`), and a success state that does not reveal whether the address was recognised.

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

1. `next.config` remotePatterns + tokens wired from `04a`. **Change `brand.tagline` to "Where Minds Meet Maps."** (§0).
2. Global shell (Header/Footer) with tests — footer grid, both offices, socials.
3. Shared cards (Feature/Destination/University/Testimonial/Audience/ImageHero).
4. **Real content pass:** replace placeholder stats and testimonials with §0, and remove the placeholder markers.
5. Home page section by section.
6. Students → Agencies → Institutions (audience pages share components).
7. **Services (§16) + Success Stories (§17).**
8. **SearchField + dropdown (§18.1–18.3)** — a11y first, against a mocked API.
9. **University + course info pages (§18.4–18.6)**, then `/universities` browse + Destinations.
10. About + Contact (form → `POST /v1/contact`, WhatsApp secondary).
11. Responsive + a11y pass; verify every image loads; swap any 403s.

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
- **v3 → v4 (this):** real **Rakuxon Ltd** brand and content (§0) replacing placeholder stats, invented testimonials and the retired tagline; new `/services` (§16) and `/success-stories` (§17); **live typeahead search → university/course info pages** (§18); footer rebuilt as a grid with both offices; contact form routed to the BE instead of WhatsApp.
- **v3 → v4:** palette retuned to the **Modern Campus** direction (deep forest green / sage / electric sky blue) in `04a` § 3.1. Structure, sections and imagery are unchanged; only colour tokens moved. The categorical tint set gained slot-based names (`tone1`–`tone4`) plus a semantic `urgent`, and `--color-success` / `--color-info` were retuned to stay distinct from the new primary and accent.

---

## 16. SERVICES — `/services`  *(NEW)*

The six real services from §0, as the consultancy's own offer — this is what Rakuxon Ltd actually sells, and it predates the platform.

- **Hero:** H1 *"From first question to first day on campus."* Subcopy naming the span: consultancy → application → visa → travel → arrival → ongoing support.
- **Six service cards** (reuse `CapabilityCard`), in the §0 order, each with icon, title, the one-line description, and a link to its anchor section.
- **Six detail sections**, one per service, each with a short paragraph, what's included, and a "Talk to an advisor" CTA → `/contact`.
- **Free consultancy gets emphasis** — it is the entry point and the strongest differentiator. Give it the first card and its own CTA band.
- **Travels & Tourism note:** this is a genuinely different offer from study-abroad (flights, hotels, vacation packages). Keep it visually distinct so it doesn't read as an add-on to an application — some visitors arrive for this alone.
- Closing CTA band → `/contact`.

---

## 17. SUCCESS STORIES — `/success-stories`  *(NEW)*

- **Hero:** H1 *"Where our students are now."* + the **95% success rate** stat.
- **Grid of the six real testimonials** (§0) — quote, name, destination university, and country flag. Full quotes, not the truncated slider version.
- Each card links to its destination page (`/destinations/[country]`) where one applies.
- **Same consent and photography rule as §3.8:** real photo or initial avatar, never a stock face on a real name.
- CTA band → *"Start your story"* → `/contact`.

---

## 18. LIVE SEARCH → INFO PAGES  *(NEW — Change 2)*

### 18.1 What it is

A **debounced typeahead** in the header (and prominently in the Home hero). As the visitor types, a dropdown shows ranked matching universities and courses; choosing one routes to that entity's detail page.

**Reference:** Edvoy's search-to-course-page flow. We mirror the **UX pattern and page structure**, not their data — the catalogue is sourced per the BE's `10-catalogue-data.md`, and **Edvoy is never fetched or stored**.

> **On Edvoy's "Genie".** Genie is AI course-matching that scores a student's
> chance of admission and buckets programs into *"Easy to get in" / "Give it a
> try" / "Tough to get in"*. It is a good pattern and worth mirroring **later**.
> It is not in this phase: `CONTEXT.md` explicitly defers AI course-matching and
> scoring (only document checks ship now). So the course page **reserves the
> slot** — a labelled admission-likelihood band in the layout — and leaves it
> unbuilt. Do not ship a tier badge computed from a guess; a fabricated
> admission-likelihood is worse than none, because students will act on it.

### 18.2 Behaviour

- Debounce **250ms**; a query under **2 characters** shows nothing (the BE returns an empty list — `07-api-contract.md`).
- Calls `GET /v1/catalogue/suggest?q=&limit=8`. **Public, unauthenticated.**
- Results grouped: **Universities** then **Courses**, each row showing title, a subtitle (institution + country for a course; city + country for a university) and a country flag.
- In-flight requests are **cancelled** when the query changes (`AbortController`) — otherwise a slow early response overwrites a fast later one and the dropdown shows results for a query the user has already moved past.
- Empty state: *"No matches for '…' — try a subject, a university, or a country."*
- Error state: a quiet inline message, never a thrown boundary. Search failing must not take the page with it.
- Clicking a result → `/universities/[slug]` or `/courses/[slug]`. **Full page navigation, not a modal** — these pages are the SEO surface.

### 18.3 Accessibility *(non-negotiable — this is a combobox, the most commonly broken widget on the web)*

- WAI-ARIA **combobox** pattern: input has `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`; the dropdown is `role="listbox"`; each row `role="option"` with a stable id; the active row is tracked with **`aria-activedescendant`** (focus stays in the input).
- **Keyboard:** ↓/↑ move, Enter selects, Escape closes and returns to the input, Tab closes and moves on.
- A **live region** announces the result count (*"8 results"*) — otherwise a screen-reader user gets no signal that anything appeared.
- Visible focus ring on every row. Touch targets ≥44px.
- Works **without JavaScript**: the field is a real `<form>` posting to `/universities?q=`, so the dropdown is a progressive enhancement rather than the only way in.

### 18.4 University page — `/universities/[slug]`

Hero (campus image, name, city + country, flag) · about · **courses at this university** (paginated, filterable by level/discipline, each linking to its course page) · entry requirements overview · tuition range · intakes · location with map · accreditation · **"How Rakuxon helps"** (the six §0 services, contextualised) · CTA band (*"Talk to an advisor"* → `/contact`).

### 18.5 Course page — `/courses/[slug]`

The Edvoy-equivalent structure, from the BE's `Program` model:

1. **Header** — course title, institution (linked), level, duration, study mode, country flag.
2. **Key facts strip** — tuition, next intake, application deadline, duration. Deadline uses the amber `urgent` tint; this is the one place it belongs.
3. **Overview** — what the course is.
4. **Entry requirements** — academic + English (IELTS/TOEFL/PTE bands) + prerequisites.
5. **Fees & funding** — tuition, currency, per year vs per course, scholarships.
6. **Intakes** — upcoming intakes with deadlines and status.
7. **Location** — campus, city, map.
8. *(reserved)* **Admission likelihood** — the Genie-equivalent slot. Not built this phase (§18.1).
9. **"How Rakuxon helps"** — free consultancy, application support, visa, pre-departure.
10. **CTA band** — *"Start your application"* → `/contact`.
11. **Related courses** — same discipline or same institution.

### 18.6 SEO

Both page types are **SSG with ISR** — they are the organic-search surface and the reason the catalogue exists publicly. Each carries `Course` / `EducationalOrganization` JSON-LD, a canonical URL, per-page title and description, and OpenGraph tags. Slugs are stable; a changed slug must 301, never 404.

### 18.7 Components (→ `packages/ui`)

**SearchField** (the combobox), **SearchDropdown** (grouped listbox), **SearchResultRow**, **KeyFactsStrip**, **RequirementsList**, **IntakeTable**, **FeesPanel**, **CourseCard**, **RelatedCourses**.

### 18.8 Data source rule

Every result and every page field comes from **our own catalogue API**, seeded per `10-catalogue-data.md` from licensed, official and open sources. **No competitor endpoint is called at runtime or at build time**, including Edvoy's.
