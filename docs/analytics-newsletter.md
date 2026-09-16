# Newsletter growth analytics — GA4 setup checklist

This is a manual checklist. Nothing here has been applied to the GA4 property —
these are steps for an operator with access to the NeuralDrift GA4 account to
perform by hand, then verify.

## Events already firing (client-side, via `lib/analytics.ts`)

| Event | Fired from | Properties |
| --- | --- | --- |
| `newsletter_cta_view` | `NewsletterSignup` becomes visible in viewport (once per mount) | `source_page`, `source_component` |
| `newsletter_signup_attempt` | Form submit, before validation/network call | `source_page`, `source_component` |
| `newsletter_signup` | Successful subscribe response | `source_page`, `source_component` |

`source_page` values in use: `homepage`, `guides`, `tutorials`, `workflow_detail`,
`lab`, `newsletter`. No email addresses or other PII are included in any event
payload — confirm this stays true if the component is extended.

## 1. Mark `newsletter_signup` as a GA4 Key Event

1. GA4 property → **Admin** → **Events**.
2. Find `newsletter_signup` in the events table (it will appear after the event
   has fired in production at least once).
3. Toggle **Mark as key event**.
4. Do **not** mark `newsletter_cta_view` or `newsletter_signup_attempt` as key
   events — they're funnel steps, not conversions.

## 2. Register custom dimensions

GA4 property → **Admin** → **Custom definitions** → **Create custom dimension**.

| Dimension name | Scope | Event parameter |
| --- | --- | --- |
| `source_page` | Event | `source_page` |
| `source_component` | Event | `source_component` |

If a `variant` property is ever added to signup events, register it the same
way (Event scope, parameter `variant`) — only do this if it's actually
implemented; don't pre-register unused dimensions.

Custom dimensions only start populating reports from the moment they're
registered onward — historical events without a matching dimension won't
backfill.

## 3. Newsletter funnel

Build this as a GA4 **Funnel exploration** (Explore → Funnel exploration):

1. `newsletter_cta_view`
2. `newsletter_signup_attempt`
3. `newsletter_signup`

Break down by `source_page` to see which pages actually expose visitors to the
signup form vs. which pages convert them. A page with high `newsletter_cta_view`
but low `newsletter_signup_attempt` is getting impressions without interest; a
page with attempts but low `newsletter_signup` completion suggests a validation
or provider error worth checking in `/api/newsletter/subscribe` logs.

## 4. Acquisition tracking via UTMs

`lib/newsletter/utm.ts` (`buildNewsletterUrl`) tags links that travel from an
actual sent issue back to the site with:

- `utm_source=neuraldrift_weekly`
- `utm_medium=email`
- `utm_campaign=issue_NNN` (e.g. `issue_001`)
- `utm_content=<optional section name>`

These surface in GA4 under **Reports → Acquisition → Traffic acquisition**,
filtered to `Session source / medium = neuraldrift_weekly / email`. This is how
question 3 ("which newsletter issues send traffic back to the site?") gets
answered — compare sessions per `utm_campaign` value across issues.

Do not add these UTM parameters to any on-site navigation link — they are only
for links that live inside an actual emailed issue.

## 5. Verifying in GA4 Realtime

1. GA4 property → **Reports** → **Realtime**.
2. In a separate tab, visit a page with `NewsletterSignup` (e.g. `/newsletter`)
   and scroll it into view — confirm `newsletter_cta_view` appears in Realtime
   within ~30 seconds, with `source_page=newsletter`.
3. Submit the form with a real test address — confirm `newsletter_signup_attempt`
   and then `newsletter_signup` both appear.
4. Visit the site via a link with the UTM parameters above appended (e.g.
   `https://neuraldrift.io/newsletter/<slug>?utm_source=neuraldrift_weekly&utm_medium=email&utm_campaign=issue_001`)
   and confirm Realtime attributes the session to that source/medium/campaign.

Nothing above has been performed against the live GA4 property by this change —
it is documentation only.
