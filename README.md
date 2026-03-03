# OfferLagbe

**Discover and share the best deals, discounts, and offers near you in Bangladesh.**

> **Live:** [offerlagbe.netlify.app](https://offerlagbe.netlify.app/)

OfferLagbe is a real-time, map-based offer discovery platform built for Bangladesh. Users can anonymously post offers they find, vote on their authenticity, and discover deals happening nearby — all without creating an account.

## Features

### Core
- **Interactive Map** — Browse offers on a MapLibre-powered map with clustering and popups
- **Heatmap Mode** — Toggle between bubble markers and heat density visualization
- **Anonymous Identity** — No sign-up required. A unique visitor ID is generated locally
- **Real-time Updates** — All data syncs instantly via Convex subscriptions
- **Offer Voting** — Community-driven trust system with upvotes/downvotes and auto-moderation
- **Community Verification Badge** — Offers with 5+ upvotes and 3+ comments earn a "Verified" badge
- **Photo Verification** — Users can upload proof photos to verify deals are real

### Discovery
- **Deal of the Day** — Gold-highlighted top-scoring recent offer
- **Trending Offers** — Hot deals from the last 48 hours
- **Best This Week** — Top-rated offers from the past 7 days
- **Top Stores Leaderboard** — Stores ranked by community upvotes and offer count
- **Nearby Offers** — See other deals within 500m of any offer
- **Store Pages** — View all offers from a specific store

### Submission
- **Google Maps Integration** — Paste a Google Maps link (including share links) to auto-detect location
- **Duplicate Detection** — Warns before posting duplicate offers nearby, while allowing same brand at different locations
- **Scam/Fake Store Detection** — Auto-flags offers from stores with >50% flagged history
- **Image Upload** — Up to 5 photos per offer, auto-compressed to WebP format
- **Rich Text Descriptions** — Markdown subset support (bold, links, bullet lists)
- **Tag System** — Tags like "Verified", "Limited Stock", "Online Only", etc.

### Search & Filters
- **Sort** — By newest, nearest, best discount, or most trusted
- **Category Filter** — 12 categories (Food, Electronics, Fashion, etc.)
- **Price Range Filter** — Filter by price brackets
- **Date Filter** — Today, this week, this month
- **Near Me** — Filter offers within 5km radius
- **Saved Offers** — Bookmark and filter by saved offers

### Social
- **Comments & Replies** — Threaded comments with upvoting
- **Share** — Share via Web Share API or clipboard
- **WhatsApp Share** — Direct WhatsApp sharing button
- **Push Notifications** — Browser push notifications for new offers matching your preferences
- **New Offer Alerts** — Real-time toast notifications for nearby new submissions

### Mobile Experience
- **Responsive Bottom Sheet** — Full sidebar on desktop, swipeable bottom sheet on mobile
- **Pull-to-Refresh** — Pull down gesture to refresh offer list
- **Swipe Actions** — Swipe right to save, left to dismiss offers
- **Back to Map FAB** — Floating button to close sidebar and return to map
- **Onboarding Tour** — 3-step tooltip walkthrough for first-time visitors
- **Sidebar-to-Map Navigation** — Clicking an offer in sidebar pans and zooms the map to its location

### Infrastructure
- **Skeleton Loading** — Shimmer placeholders while content loads
- **Offline Mode** — Cached offers available when offline via IndexedDB + Service Worker
- **PWA** — Installable as a Progressive Web App
- **OG Meta Tags** — Dynamic rich previews when sharing on WhatsApp/Facebook via Netlify Edge Functions
- **Bilingual** — Full English and Bengali translations
- **Dark Theme** — Glass morphism dark UI with smooth animations
- **Countdown Timers** — Live countdown for expiring offers
- **Coupon Codes** — Copy-to-clipboard coupon code badges
- **Directions** — One-tap directions via Google Maps (uses original Google Maps link when available)
- **Image Carousel** — Swipeable image gallery with lightbox

## Tech Stack

- **Frontend**: React 19, TanStack Router, Tailwind CSS v4
- **Backend**: Convex (real-time database + serverless functions)
- **Maps**: MapLibre GL JS + OpenFreeMap tiles (free, no API key)
- **Language**: TypeScript (strict mode)
- **Build**: Vite 7 (Rolldown bundler)
- **Package Manager**: Bun
- **Linting**: Biome
- **Deployment**: Netlify + Convex Cloud

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- A [Convex](https://convex.dev) account (free tier)

### Setup

```bash
# Clone the repository
git clone https://github.com/EhsanulHaqueSiam/offerlagbe.git
cd offerlagbe

# Install dependencies
bun install

# Set up Convex
bunx convex dev

# Start the dev server
bun run dev
```

### Seed Demo Data

After setting up Convex, you can seed demo offers via the Convex dashboard by running the `seed:seedOffers` internal mutation.

## Project Structure

```
convex/           # Backend: Convex schema, queries, mutations, actions
  offers.ts       # Offer CRUD, duplicate check, scam detection
  votes.ts        # Voting logic with trust system
  comments.ts     # Threaded comments with vote tracking
  notifications.ts # Push notification subscriptions
  verificationPhotos.ts # Photo verification system
  leaderboard.ts  # Top stores ranking
src/
  components/     # React components
    map/          # OfferMap, OfferBubbles (heatmap + clusters), OfferPopup
    offers/       # OfferCard, SubmitOfferForm, CommentSection, PhotoVerification
    notifications/ # Push notification settings
    voting/       # VoteButtons, TrustBadge
    ui/           # Header, Sidebar, Skeleton loaders, SwipeableCard, etc.
  hooks/          # Custom React hooks (offline, notifications)
  lib/            # Utilities (i18n, location, Google Maps parser, bookmarks, etc.)
  routes/         # TanStack Router file-based routes
  types/          # TypeScript type definitions
public/           # Static assets, Service Worker, manifest
netlify/          # Netlify Edge Functions (OG meta tags)
```

## Security

- All user inputs validated server-side with length limits and type checks
- Rate limiting on all write operations (offers, votes, comments, reports)
- XSS-safe markdown parser (escape-first approach)
- Content Security Policy headers
- Visitor IDs truncated in API responses to prevent impersonation
- SVG uploads blocked (XSS vector)
- Image compression to WebP before upload (max 300KB)
- Seed mutation is internal-only (not callable from client)
- Convex deployment URL in HTML is safe — it's a public API endpoint with server-side auth

## Contributors

- **Ehsanul Haque Siam** — [GitHub](https://github.com/EhsanulHaqueSiam)
- **Aonyendo Paul** — [GitHub](https://github.com/nitpaul)

## License

MIT
