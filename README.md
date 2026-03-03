# OfferLagbe

**Discover and share the best deals, discounts, and offers near you in Bangladesh.**

OfferLagbe is a real-time, map-based offer discovery platform built for Bangladesh. Users can anonymously post offers they find, vote on their authenticity, and discover deals happening nearby — all without creating an account.

## Features

- **Interactive Map** — Browse offers on a MapLibre-powered map with clustering and popups
- **Anonymous Identity** — No sign-up required. A unique visitor ID is generated locally
- **Real-time Updates** — All data syncs instantly via Convex subscriptions
- **Offer Voting** — Community-driven trust system with upvotes/downvotes and auto-moderation
- **Comments & Replies** — Threaded comments with upvoting on each offer
- **Report Abuse** — Flag spam, fake, expired, or inappropriate offers
- **Image Upload** — Attach up to 5 photos per offer with automatic compression
- **Nearby Offers** — See other deals within 500m of any offer
- **Store Pages** — View all offers from a specific store
- **Countdown Timers** — Live countdown for expiring offers
- **Tag System** — Tags like "Verified", "Limited Stock", "Online Only", etc.
- **Price & Date Filters** — Filter by price range, date posted, category
- **Leaderboard** — Top contributors ranked by community upvotes
- **Offline Mode** — Cached offers available when offline via IndexedDB
- **PWA** — Installable as a Progressive Web App with service worker caching
- **Bilingual** — Full English and Bengali (bn) translations
- **Dark Theme** — Glass morphism dark UI with smooth animations
- **Directions** — One-tap directions to any offer via Google/OSM Maps
- **Coupon Codes** — Copy-to-clipboard coupon code badges
- **Duplicate Detection** — Warns before posting duplicate offers nearby
- **Rich Text Descriptions** — Markdown subset support (bold, links, bullet lists)
- **Image Carousel** — Swipeable image gallery with lightbox
- **Responsive** — Works on desktop and mobile with bottom sheet on small screens

## Tech Stack

- **Frontend**: React 19, TanStack Router, Tailwind CSS v4
- **Backend**: Convex (real-time database + serverless functions)
- **Maps**: MapLibre GL JS + OpenFreeMap tiles (free, no API key)
- **Language**: TypeScript
- **Build**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account (free tier)

### Setup

```bash
# Clone the repository
git clone https://github.com/EhsanulHaqueSiam/offerlagbe.git
cd offerlagbe

# Install dependencies
npm install

# Set up Convex
npx convex dev

# Copy environment template and fill in your Convex URL
cp .env.example .env.local

# Start the dev server
npm run dev
```

### Seed Demo Data

After setting up Convex, you can seed demo offers via the Convex dashboard by running the `seed:seedOffers` internal mutation.

## Project Structure

```
convex/           # Backend: Convex schema, queries, and mutations
src/
  components/     # React components (map, offers, UI, voting)
  hooks/          # Custom React hooks
  lib/            # Utilities (i18n, location, markdown, bookmarks, etc.)
  routes/         # TanStack Router file-based routes
  types/          # TypeScript type definitions
public/           # Static assets, SW, manifest
```

## Security

- All user inputs validated server-side with length limits and type checks
- Rate limiting on all write operations (offers, votes, comments, reports)
- XSS-safe markdown parser (escape-first approach)
- Content Security Policy headers
- Visitor IDs truncated in API responses to prevent impersonation
- SVG uploads blocked (XSS vector)
- Seed mutation is internal-only (not callable from client)

## Contributors

- **Ehsanul Haque Siam** — [GitHub](https://github.com/EhsanulHaqueSiam)
- **Aonyendo Paul** — [GitHub](https://github.com/nitpaul)

## License

MIT
