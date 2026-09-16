# Google Search Console checklist

Manual checklist for an operator with access to Google Search Console. Nothing
here has been performed automatically — no verification, submission, or
indexing request has been made on the user's behalf.

## 1. Verify the domain property

1. Search Console → **Add property** → **Domain** → `neuraldrift.io`.
2. Verify via the DNS TXT record method (covers all subdomains and protocols,
   unlike a URL-prefix property).
3. Confirm the property shows as verified before continuing.

## 2. Submit the sitemap

1. Search Console → **Sitemaps** (left nav, under Indexing).
2. Enter `sitemap.xml` and submit — full URL is
   `https://neuraldrift.io/sitemap.xml`.
3. Confirm it's picked up as "Success" (may take a few minutes to a day).

`app/robots.ts` already declares this sitemap URL, so Google should also find
it via robots.txt discovery even without manual submission — manual submission
just speeds up the first crawl.

## 3. Request indexing for high-value URLs

Use **URL Inspection** (top search bar in Search Console) → **Request
Indexing** for these specifically, once each is live in production:

- `/`
- `/workflows`
- `/compatibility`
- `/hardware/rtx-5080`
- `/guides`
- `/tutorials`
- `/newsletter`

Do this once per URL after it ships or after a significant content change —
not repeatedly. Search Console rate-limits manual indexing requests, and
repeated requests for the same unchanged URL don't speed anything up.

## 4. What to monitor going forward

- **Indexing → Pages**: watch for "Discovered — currently not indexed" or
  "Crawled — currently not indexed" on new routes (`/newsletter`,
  `/newsletter/<slug>`, and the sitemap additions from this change:
  `/hardware/rtx-5080`, `/tools/benchmark-lookup`, `/tools/caption-generator`,
  `/privacy`, `/terms`, `/optimizer`, `/optimizer/fix-my-pc`,
  `/prompt-generator`, `/lora-training`, `/datasets`, `/proofs`,
  `/workflows/create`, `/gpu-guide/runpod`). Give it 1-2 weeks before treating
  a non-indexed status as a problem.
- **Sitemaps**: confirm the "Discovered URLs" count on the submitted sitemap
  rises to match the new page count, and that there are no "Couldn't fetch"
  errors.
- **Performance → Search results**: filter by page (`/newsletter*`) to see
  impressions/clicks once issues start ranking. This is the source for
  question 3 in the growth phase brief ("which newsletter issues send traffic
  back to the site?") from the search side — cross-reference with the
  `utm_source=neuraldrift_weekly` GA4 acquisition report (see
  `docs/analytics-newsletter.md`) for the email side.

## 5. What not to do

- Do not request indexing for every individual `/workflows/<id>` page — there
  are 50 of them; let Google discover them through the sitemap and internal
  linking (the workflows hub links to all of them). Reserve manual URL
  Inspection requests for new major landing pages and significantly updated
  cornerstone pages, per the list in section 3.
- Do not treat a "not indexed" status as a bug to immediately escalate — some
  of it is normal for a low-authority or newly-launched domain and resolves
  with time and internal linking, not with repeated manual requests.
- Do not invent or report Search Console numbers (impressions, clicks,
  position, indexed-page counts) that haven't actually been pulled from the
  live property.
