# LuxePass Frontend (Next.js)

This frontend now runs on Next.js while preserving the existing app features and route behavior.

## Scripts

- `npm run dev` starts Next.js dev server
- `npm run build` builds production assets
- `npm run start` runs the production server
- `npm run test` runs Vitest tests

## Environment Variables

Create `.env.local` from `.env.example` and set values as needed:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_WHATSAPP_BACKEND_URL`

## Routing Compatibility

Current routes are preserved through a catch-all Next.js route and the existing client router, so existing feature paths continue to work.
