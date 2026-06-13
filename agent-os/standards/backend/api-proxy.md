# API Proxy

## Catch-All Proxy Route

Do not define individual Next.js API routes for backend endpoints. The project uses a single catch-all proxy route at `src/app/api/proxy/[...path]/route.ts`.

- All client-side Axios requests must hit `/api/proxy/*`
- The proxy automatically reads the path and forwards it directly to the real backend (`API_URL + API_PREFIX`)

**Why:** It eliminates frontend boilerplate. Instead of manually writing and maintaining a new Next.js route handler for every new backend endpoint, the proxy blindly forwards everything, keeping the frontend lightweight.

## Server-Side Token Injection

The frontend client should never store, read, or attach raw JWTs directly via Axios headers or local storage. 

- Tokens are stored exclusively in secure, `httpOnly` cookies via Next.js
- The `src/app/api/proxy/[...path]/route.ts` reads the cookie server-side and injects it as an `Authorization: Bearer <token>` header before proxying to the NestJS backend

**Why:** It eliminates the risk of Cross-Site Scripting (XSS) attacks stealing the active session. Because the cookie is `httpOnly`, the frontend JavaScript cannot read the token, keeping it perfectly secure while the proxy transparently handles authentication.

## Automatic Token Refresh

Token expiration and refreshing is handled entirely server-side by the proxy.

- When the backend returns a `401 Unauthorized` response, the proxy automatically intercepts it.
- If a refresh token is present in the cookies, the proxy calls `/auth/refresh-token`, updates the secure cookies with the new tokens, and retries the original request seamlessly.
- If the refresh fails, the proxy clears the cookies and returns the 401 to the frontend (which then triggers a redirect to login).

**Why:** It prevents abrupt logouts without burdening the frontend with complex retry logic. Access tokens expire frequently for security; handling the refresh cycle transparently in the proxy ensures an uninterrupted user experience.

