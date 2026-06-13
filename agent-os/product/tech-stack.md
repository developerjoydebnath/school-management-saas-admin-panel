# Tech Stack

## Frontend

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + Shadcn UI (Radix UI primitives) + SCSS for design tokens
- **State Management**: Zustand v5 (client state), SWR v2 (server data / cache)
- **Forms**: React Hook Form v7 + Zod (via @hookform/resolvers)
- **Tables**: TanStack Table v8
- **Rich Text Editor**: TipTap v3 (with full extension suite)
- **Charts**: Recharts v3
- **Drag & Drop**: dnd-kit
- **Animations**: tw-animate-css
- **Date Handling**: date-fns v4
- **Icons**: Tabler Icons React + Lucide React
- **HTTP Client**: Axios

## Backend

- **Runtime**: Next.js API Routes (App Router) + Next.js Middleware (auth, i18n routing)
- **Auth**: Custom JWT-based auth using `jose`
- **Real-time**: Socket.IO client (v4) for live notifications
- **Mock API** (development): json-server on port 3001

## Database

- **Production**: Connected via API (backend service, not directly in this repo)
- **Development Mock**: `db.json` (json-server)

## Internationalization

- **Library**: next-intl v4
- **Languages**: English (`en`) and Bangla (`bn`)
- **Message files**: `src/messages/en.json`, `src/messages/bn.json`

## Other

- **QR / Barcode**: html5-qrcode, jsbarcode, qrcode
- **OTP Input**: input-otp
- **Carousel**: embla-carousel-react
- **Theming**: next-themes (light/dark mode)
- **Utilities**: clsx, tailwind-merge, lodash, immer, ts-pattern, date-fns
- **Dev Tools**: ESLint (Next.js config), Prettier + prettier-plugin-tailwindcss, Sass
- **Hosting Target**: Vercel (Next.js-native deployment)
- **Fonts**: Inter (primary UI), Geist + Geist Mono (mono/code contexts) via Google Fonts / next/font
