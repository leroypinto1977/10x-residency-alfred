# @founder10x/meta

The Meta Conversions API client, shared by the landing site and the admin panel.

## What this is for

The pixel on the landing site tells Meta *a form was submitted*. Meta responds
by finding more people who submit forms — which is not the same as more people
worth talking to.

Reporting the CRM stages back closes that loop: Meta learns which of those
submissions were contacted, made it to a call, and became customers, and
optimises towards those people instead. That is the whole value of "connecting
the pixel to the CRM", and it is server-to-server. **There is deliberately no
pixel on any admin page** — `fbevents.js` on an internal tool would count the
team as site visitors, enrol them in retargeting, and hand Meta the URLs of a
screen listing applicants' phone numbers and incomes.

## Events

| Sent by | Event | `action_source` | When |
| --- | --- | --- | --- |
| Landing site | `Lead` | `website` | The application form is submitted (browser pixel + server, deduped on `eventId`) |
| Admin panel | `crm_qualified_lead` | `system_generated` | The lead is rated **Hot** |
| Admin panel | `crm_contacted` | `system_generated` | Status → **Contacted** |
| Admin panel | `crm_call_done` | `system_generated` | Status → **Call done** |
| Admin panel | `crm_won` | `system_generated` | Status → **Won** |
| Admin panel | `crm_lost` | `system_generated` | Status → **Lost** |

Each CRM stage is sent at most once per lead. The ledger lives in the
`MetaConversion` table and is shown in the lead sheet under *Reported to Meta*,
so an expired token is visible in the panel rather than only in Events Manager
three weeks later.

## Environment

Both apps must report to the **same dataset**, or Meta cannot join a website
`Lead` to the CRM stages that follow it.

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_FB_PIXEL_ID` | web | Dataset id; also renders the browser pixel |
| `META_DATASET_ID` | admin | The same id. The panel has no `NEXT_PUBLIC_` anything |
| `META_CAPI_ACCESS_TOKEN` | web + admin | Events Manager → Settings → Conversions API → Generate access token |
| `META_CAPI_TEST_EVENT_CODE` | either, optional | Set while watching Test Events; **unset in production** or events never reach the live dataset |
| `META_GRAPH_API_VERSION` | optional | Defaults to `v26.0` |

## Setting it up in Events Manager

1. Deploy, then move a test lead through the statuses in the panel.
2. Events Manager → your dataset → **Test events**: with
   `META_CAPI_TEST_EVENT_CODE` set, the `crm_*` events appear as you click.
3. Once they are arriving, create a **Custom Conversion** for each stage worth
   reporting on (`crm_call_done`, `crm_won`). That is what makes cost per
   *qualified* lead — rather than cost per form fill — visible per campaign.
4. Build a Custom Audience from `crm_won` and a lookalike off it. This is the
   fastest-acting benefit, and it works at any volume.
5. Optimising an ad set directly for `crm_call_done` needs enough weekly
   volume for Meta to learn from. Meta's dedicated *Conversion Leads*
   performance goal is **not** available here: it requires Facebook/Instagram
   Lead Ads (instant forms), and this funnel uses the site's own form.

## Match quality

`fbp` and `fbc` are captured on the `ClientIntake` row at submission time,
because by the time the panel reports a stage the browser cookies are long
gone. When the pixel was blocked, `fbc` is rebuilt from the `fbclid` on the
landing URL. Leads that predate this capture match on hashed email and phone
alone — weaker, but still matched.
