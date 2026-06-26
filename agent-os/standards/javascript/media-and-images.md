# Media and Image Handling Standards

This document defines the standard patterns for handling image uploads, rendering external images, and configuring Next.js image optimization in the frontend.

## 1. Image Upload Flow

- Always upload images *before* submitting the main entity form.
- Use `uploadApi.ts` (`uploadImage`) with `FormData` to send images to the backend.
- The backend responds with `{ url, placeholder, mediaId }`.
- Insert `url` and `placeholder` into the form payload (e.g., `payload.logoUrl = res.url; payload.logoPlaceholder = res.placeholder;`).
- Compress images on the client-side *before* uploading (e.g., using a `compressImage` utility) to save bandwidth.

## 2. Rendering External Images (`<ProgressiveImage />`)

- **Never** use raw `<Image />` or `<img>` for user-uploaded media.
- Always use the shared `<ProgressiveImage />` component.
- The `ProgressiveImage` component handles:
  - Automatically appending the `NEXT_PUBLIC_API_URL` when a `src` starts with `/public/uploads/`.
  - Base64 blur placeholders during load.
  - Fallback images when the image 404s or fails to load (e.g., falling back to `/images/data-not-found.png`).

### Example usage:
```tsx
<ProgressiveImage
	src={school.logoUrl}
	placeholderBase64={school.logoPlaceholder}
	alt="School Logo"
	fill
	className="rounded-md"
/>
```

## 3. Next.js Image Config (`next.config.ts`)

- **Do NOT** use a global custom `loaderFile` in `next.config.ts`.
  - Global custom loaders force you to manually append `?w=width` to every local asset and break Next.js's native static asset optimizer.
- Instead, rely on Next.js's built-in image optimizer and allow backend external domains via `remotePatterns`:
```typescript
images: {
	remotePatterns: [
		{
			protocol: backendUrlObj.protocol.replace(":", "") as "http" | "https",
			hostname: backendUrlObj.hostname,
			port: backendUrlObj.port,
			pathname: "/**",
		},
	],
},
```
- Local assets (e.g., `/images/logo-transparent.png`) will be optimized automatically by Next.js.
- External backend assets (e.g., `http://localhost:5000/public/uploads/...`) will be downloaded and optimized automatically because `ProgressiveImage` prepends the backend host.
