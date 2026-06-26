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
