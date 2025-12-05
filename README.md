# UsernameScan (Phase 1 MVP)

A fast, production-ready, single-page username availability checker using Next.js 15 (App Router) + Tailwind CSS.

## Features
- **7 Platforms**: GitHub, Reddit, Twitch, ProductHunt, Behance, Dribbble, Pinterest
- **Zero Backend**: All checks run client-side
- **Caching**: Results cached in sessionStorage (60s TTL)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

3. **Deploy to Vercel**:
   ```bash
   vercel deploy --prod
   ```
