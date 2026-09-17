# Where this project goes

An honest assessment of what PersonaPage is, who it is for, what already exists,
and what is worth building next. Written for me, and for anyone evaluating the
repo who wants to know whether the thinking went past the code.

---

## What it actually is

One profile, stored once. From it, any number of public pages, each written for
a specific kind of reader, each on its own URL, each counting who opened it.

The mechanic is three things stacked, and it is worth separating them because
they are not equally valuable:

1. **AI rewriting per audience** — the visible feature. Also the commodity one.
2. **A public, shareable artifact** — a URL you hand someone.
3. **Per-link analytics** — you can tell whether it was opened.

Most of the attention goes to (1). I now think the durable value is in (3).

---

## Who has this problem

Being specific matters more than being broad, so in order of how real the pain
actually is:

**Freelancers and consultants — strongest.** Someone who does design work for
startups and dev work for agencies genuinely maintains two portfolios today, by
hand, and keeps them out of sync. Multiple audiences is their normal state, not
an edge case. They also already pay for tools.

**People with a portfolio career.** The developer who also produces music, the
researcher who also consults. Their single profile is always wrong for somebody.

**Founders.** Raising, hiring and selling at once, with three different stories.
Real, but they already reach for a deck, a careers page and a website — three
tools that are each better at their job than a profile page.

**Job seekers and students — weakest, despite being the obvious answer.** This
is the segment I started from, and it is the one where the premise is thinnest.
A job seeker mostly has *one* audience: recruiters. "A different version per
audience" solves a problem they do not really have. What they do have is a
different problem, and it points somewhere better — see the wedge below.

**Conference networking.** Genuinely useful: you meet forty people in two days
and a tailored link beats a LinkedIn QR code. But it is episodic. Nobody
subscribes to something they use twice a year.

---

## What already exists

| | What it does | What it does not do |
|---|---|---|
| **Linktree, Beacons, Bio.link** | Owns "one link in your bio". Free, enormous, built for creators | No tailoring. Every visitor gets the same page |
| **LinkedIn** | Owns professional identity outright | One profile, one voice, no control over framing per reader |
| **Teal, Rezi, Kickresume** | Tailors a CV to a specific job posting with AI | Produces a private document for an ATS, not a public link. No idea whether anyone read it |
| **Read.cv** | Beautiful professional profiles | One version. Wound down after acquisition — worth noting that "nicer profile pages" was not enough on its own |
| **Carrd, Super, Framer** | Personal sites | Manual, one version, no analytics tied to who you sent it to |
| **DocSend** | Tracked document links, knows who opened what | Documents, not identity. Priced for companies |

The gap is real: nobody combines *audience-conditioned content* with a *public
link* and *per-link analytics*. Teal tailors but stays private. Linktree is
public but never tailors. DocSend tracks but handles files.

**The harder question is whether the gap is empty because it is valuable or
because it is not.** Honest reasons it might be the latter: maintaining several
versions of yourself is work, choosing between them is another decision, and for
most people one good profile is genuinely enough. Some people also find the idea
faintly dishonest, which is a real objection and not one to wave away — the
answer is that the facts never change, only the order and the emphasis, which is
exactly what everyone already does out loud in a conversation.

---

## The wedge

The five audience categories are too coarse. "Recruiter" is not an audience —
*this* recruiter, at *this* company, for *this* role is an audience.

The sharper version of this product is:

> Paste a job description, a company, or a person's profile. Get a page written
> for that specific opportunity, on its own link. Find out whether they opened
> it.

That changes the unit from "a version of me" to "a link I sent to someone", which
is a much better unit. It is generated on demand, it has an obvious moment of
use, and it accumulates rather than needing maintenance.

And it makes the analytics the point rather than a footnote. **"Did the recruiter
actually look at it?"** is a question every applicant genuinely wants answered
and currently cannot. "Your Stripe application link was opened three times, twice
the day before your interview" is a notification people would come back for.

That is the positioning worth pursuing: not *Linktree with AI*, but closer to
**DocSend for your professional identity**. The AI writing gets you the artifact;
the tracking is what makes anyone return.

---

## What to build next

In order, most valuable first:

1. ~~**Per-recipient links.**~~ **Built.** A link can now be aimed at one
   company or person rather than an abstract category, and analytics labels
   each row by recipient.
2. ~~**Generate from a job description.**~~ **Built.** Paste the posting and the
   page is written against it. Grounding did not move: the posting controls
   emphasis, never claims, and the source text is stored in a table with no
   public policy so it can never reach the profile page.
3. **Analytics worth opening the app for.** *Mostly built.* First-open time
   relative to when the link was created, and how many separate days it was
   opened on, are both shown per link now. Time on page is the piece still
   missing.
4. **Notify on open.** Email or push the first time a link is opened. This is
   the retention loop; without it there is no reason to log back in. It is now
   the top of this list, and the first item that needs infrastructure (an email
   provider) rather than only code.
5. ~~**Outbound click tracking.**~~ **Built.** Clicks on the contact button are
   recorded and shown beside views with a click-through rate, so "14 views"
   finally distinguishes fourteen people who read it from fourteen who acted.

## What to deliberately not build

- **Custom domains and themes.** Linktree's ground, and a fight over polish that
  a solo project does not win.
- **More link types, embeds, widgets.** Same reason.
- **A mobile app.** The artifact is a URL. A URL does not need an app.
- **Team or company accounts.** A different product with a different buyer.

---

## Honest read on viability

**As a business: moderate at best.** The adjacent space is crowded and partly
free, the segment with the clearest pain (freelancers) is not the one most
easily reached, and the segment most easily reached (students) has the weakest
version of the problem and the least money. Distribution is the binding
constraint, not the build. The per-recipient-link wedge above is the version I
would actually test, and I would test it by putting it in front of thirty
freelancers before writing more code.

**As a demonstration of engineering and product judgement: strong, and that is
a legitimate reason to finish something.** It is a real full-stack system — row
level security doing the access control rather than app code, a public surface
that anonymous visitors can use without leaving data behind, cost controls on an
endpoint that calls a paid API, an offline path so the whole thing runs with no
API key, and a test suite covering the parts where being wrong is silent instead
of loud.

Those are the things worth pointing at. Not the AI.
