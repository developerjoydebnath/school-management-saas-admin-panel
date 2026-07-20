# Data Fetching

## Axios Singleton

Always import axios from `@/shared/lib/axios`. Never use raw `fetch`, `import Axios from 'axios'` directly, or create a new axios instance.

```ts
// ✅ Correct
import axios from "@/shared/lib/axios";
await axios.post("/endpoint", payload);

// ❌ Wrong
import Axios from "axios"; // raw import
await fetch("/api/proxy/endpoint"); // raw fetch
```

**Why:** The singleton routes all requests through `/api/proxy`, keeping the backend URL and auth credentials server-side. It also automatically injects the `Accept-Language` header for i18n and handles error toasting globally.

- No exceptions — all client-side HTTP goes through this singleton
- The `baseURL` is `/api/proxy` — do not prepend it manually

## Global Academic Session Context

The header session switcher is the single source of truth for the selected academic session.

- Persist the selected session in `useSessionStore`; it mirrors to localStorage for reloads and a cookie for proxy/fetch fallback.
- The Axios singleton automatically sends `x-academic-session-id` on every request when a session is selected.
- Do not manually add `sessionId` to every API call just because the header exists. Add explicit query params only when a feature needs a different session than the globally selected one.
- Session-scoped modules such as students, admissions, exams, syllabuses, timetables, attendance, fees, and class promotion should use the selected session by default.
- Non-session-scoped modules such as staff/teachers, inventory catalogs, permissions, roles, schools, and static setup data should ignore the selected session unless a specific workflow requires it.
- If a page has a session filter, that explicit filter overrides the header session. Because filters support multiple values, send selected session filters as a comma-separated query value such as `sessionId=2023-id,2024-id`.
- When the session filter is cleared, the page must fall back to the header selected session automatically.

Precedence for session-scoped screens:

1. Explicit page/session filter query value.
2. Header selected session from `x-academic-session-id`.
3. Backend current/active session fallback.

**Why:** Session context is global UX state, but not every domain is session-owned. Sending it consistently lets the backend make intelligent opt-in choices without polluting every component with duplicated query wiring.

## Session-Aware Sections

`Class` and `Section` are master setup records, but section availability can vary by academic session. When a form or filter needs sections for a class:

- Use the dedicated section option API, not sections embedded in a class list payload.
- Pass the form/filter `sessionId` when the screen has a session field.
- If no explicit form/filter session exists, allow the backend to use the header selected session from `x-academic-session-id`.
- If a user changes the form session or class, clear any selected section value that is no longer available.
- If the API returns no sections for that class/session, hide or disable section selection and treat the workflow as class-level.

**Why:** A school may split Class 1 into sections A/B in one session and have no sections in the next session. Reusing static class sections would create invalid admissions, timetables, syllabuses, and student filters.

## Payment Method Options

Payment method choices are school-managed settings. Whenever a form or filter needs a payment method:

- Do not hardcode bKash, Nagad, cash, bank, or gateway options in the feature component.
- Use `/settings/payment-methods/active-options` for protected admin screens.
- Public admission/portal screens must receive payment methods from their public config API; never call protected settings endpoints from a public page.
- Only use active methods in user-facing payment forms and filters.
- Store/send the provider value (`cash`, `bank_transfer`, `bkash`, `nagad`, `rocket`, `sslcommerz`, etc.); show the configured display label in UI.
- Credentials must never be exposed to frontend option APIs. Option APIs return label/value only.

**Why:** Each Bangladeshi school can enable different channels and credentials. Centralizing this keeps admissions, fee collection, and payment history consistent while avoiding credential leaks.

## GET Requests — useSWR

Use the project's `useSWR` hook for all GET requests. Never call `useSWRInstance` directly.

```ts
import { useSWR } from "@/shared/hooks/use-swr";

const { data, isError, isLoading } = useSWR("/students", { page: 1, limit: 10 });
```

- Pass `url` as the first arg, query params as the second (automatically serialized)
- Returns `data` already unwrapped from Axios's `response.data`, but since the backend wraps payloads in `{ success: true, data: { ... } }`, you must access `data.data` to get the actual payload.
- Defaults: `shouldRetryOnError: false`, `revalidateOnFocus: false` (override via third `options` arg if needed)
- Pass `null` as url to conditionally disable fetching
- **Multi-Option Filters**: When building the query parameters object, if a filter accepts multiple values (e.g., an array of `billingCycle`), always join the array into a comma-separated string (`.join(',')`) before sending it to the backend. Do not send raw arrays directly, as URL serialization may behave inconsistently.

## Paginated Lists — useTableData

Use `useTableData` for any endpoint returning `{ data: { items: [], meta: {} } }` (the standard paginated list shape). Use plain `useSWR` for everything else (single records, non-paginated responses).

```ts
import { useTableData } from "@/shared/hooks/use-table-data";

const { data, meta, isLoading } = useTableData("/students", { page, limit, search });
// data → items array (already extracted)
// meta → { page, limit, total, totalPages, hasNextPage, hasPreviousPage }
```

- Never manually extract `.data.items` or `.data.meta` when using this hook
- For infinite scroll / load-more, use `useSWRInfinite` from `@/shared/hooks/use-swr-infinite` instead

## Loading States — Progressive Skeletons

Always show progressive skeleton loaders for async UI states. Do not render plain text such as `Loading...`, `Loading data...`, or a single generic spinner as the primary loading state.

- Match the skeleton shape to the final layout: table rows for tables, cards for card lists, field blocks for forms, and media rectangles for image/document previews.
- Prefer multiple skeleton blocks that progressively communicate page structure instead of one large blank rectangle.
- Details pages and edit pages should show skeleton sections while fetching the detail API.
- Empty states are only for successfully loaded empty data; they must not be reused as loading states.

**Why:** Skeletons reduce perceived wait time, avoid layout jumps, and keep admin screens feeling consistent while server data loads.

## Infinite Scroll — useSWRInfinite

Use for progressive load patterns (infinite scroll, "Load more" button). Do NOT use for standard paginated tables — use `useTableData` for those.

```ts
import { useSWRInfinite } from "@/shared/hooks/use-swr-infinite";

const { data, meta, size, setSize, isLoading } = useSWRInfinite("/feed", { limit: 20 });
// data → flat array of all loaded items across pages
// meta → meta from the last loaded page
// setSize(size + 1) → load next page
```

- Fetching stops automatically when a page returns an empty `items` array
- `data` is pre-flattened — no need to flatMap pages manually

## Cache Invalidation After Mutations

After any POST / PATCH / DELETE, call `mutate(endpoint)` to invalidate the SWR cache for that endpoint.

When one mutation affects multiple related endpoints, invalidate the full cache family from the mutation hook. For example, session create/update/status/delete must refresh both paginated `/sessions...` keys and `/sessions/active-list`, so use a predicate like `key.startsWith("/sessions")` instead of only calling a local bound `mutate()`.

```ts
import { mutate } from "swr";
import axios from "@/shared/lib/axios";

await axios.post("/students", payload);
mutate("/students"); // triggers re-fetch for all useSWR/useTableData using this key
```

- Always invalidate immediately after a successful mutation — never rely on revalidateOnFocus
- The key must match exactly the URL string passed to `useSWR` / `useTableData` (including any query string if applicable)
