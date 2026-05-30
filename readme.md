# SangSangai 🏔️
**JunctionX Kathmandu Hackathon 2026 | Theme: Heritage & Culture | Team: TECDEVx**

---

## What We're Building

**SangSangai** is a trekking safety app that connects Nepali guides with foreign trekkers. It tracks their journey through waypoints, alerts emergency contacts if someone goes missing, and rewards Nepali guides with **SangPoints** on the Polygon blockchain. The entire backend — for the mobile app, the admin panel, and the web — runs on a single Next.js project.

---

## Architecture

```
SangSangai/
├── sangsangai-backend/      ← Next.js 14 (API + Admin Panel)
├── sangsangai-mobile/       ← React Native / Expo
└── sangsangai-blockchain/   ← Hardhat + Solidity (Polygon Amoy)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend / API | Next.js 14 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL) via Prisma |
| Mobile | React Native + Expo Router |
| Blockchain | Solidity ERC-20 on Polygon Amoy |
| Notifications | Firebase Cloud Messaging (Admin SDK) |
| Auth | JWT (Bearer token) |
| Deployment | Vercel (backend) + Expo EAS (mobile) |

---

## Why Next.js as the Unified Backend

One codebase handles everything: the API (via Route Handlers), the admin dashboard (via Next.js pages), and optionally a public marketing site. The mobile app (React Native/Expo) calls the Next.js API endpoints over HTTP. One deployment, one codebase, one set of environment variables.

---

## Project Structure

### Backend (`sangsangai-backend/`)
```
src/
├── app/
│   ├── api/                     ← All REST endpoints (replaces Express)
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── users/
│   │   │   └── me/
│   │   │       ├── route.ts
│   │   │       └── sangpoints/route.ts
│   │   ├── trips/
│   │   │   ├── route.ts
│   │   │   ├── matches/route.ts
│   │   │   └── [id]/
│   │   │       └── knowledge-card/route.ts
│   │   ├── matches/
│   │   │   └── [id]/
│   │   │       ├── accept/route.ts
│   │   │       ├── depart/route.ts
│   │   │       └── complete/route.ts
│   │   ├── waypoints/
│   │   │   └── [id]/
│   │   │       └── confirm/route.ts
│   │   └── cron/
│   │       └── waypoint-alerts/route.ts
│   ├── admin/                   ← Admin panel (server-rendered pages)
│   │   ├── page.tsx             (Dashboard)
│   │   ├── users/page.tsx
│   │   ├── trips/page.tsx
│   │   ├── matches/page.tsx
│   │   ├── alerts/page.tsx
│   │   ├── sangpoints/page.tsx
│   │   └── firebase-logs/page.tsx
│   └── (public)/
│       └── page.tsx             ← Landing page
├── lib/
│   ├── prisma.ts                ← Singleton Prisma client
│   ├── firebase.ts              ← Firebase Admin SDK init
│   ├── sangpoints.ts            ← Ethers.js blockchain bridge
│   └── auth.ts                  ← JWT verification wrapper
├── middleware.ts                ← Protects /admin/* routes
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## Database Schema (Prisma + Supabase)

**Tables:** `User`, `Route`, `Waypoint`, `Trip`, `Match`, `WaypointConfirmation`, `SangPointsLedger`

**Enums:**
- `Role`: TREKKER | GUIDE | ADMIN
- `TripStatus`: OPEN | MATCHED | DEPARTED | COMPLETED | CANCELLED
- `MatchStatus`: PENDING | ACCEPTED | DEPARTED | COMPLETED | REJECTED
- `LedgerType`: MINT | REDEEM

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user, hash ID, return JWT |
| POST | `/api/auth/login` | Login, return JWT |
| GET | `/api/users/me` | Return current user profile |
| GET | `/api/users/me/sangpoints` | Live SangPoints balance from Polygon |
| POST | `/api/trips` | Create trip, auto-assign waypoints |
| GET | `/api/trips/matches` | Browse matching trips |
| POST | `/api/matches` | Send connection request |
| PUT | `/api/matches/[id]/accept` | Accept match → Firebase notification |
| PUT | `/api/matches/[id]/depart` | Confirm departure → blockchain record |
| POST | `/api/waypoints/[id]/confirm` | Confirm waypoint → alert emergency contacts |
| PUT | `/api/matches/[id]/complete` | Complete trip → mint 200 SangPoints |
| GET/POST | `/api/trips/[id]/knowledge-card` | Read/write itinerary |
| GET | `/api/cron/waypoint-alerts` | Cron: check overdue every 30 min |

---

## Admin Panel (`/admin`)

Protected by JWT with `role: admin`. Server-side rendered pages using Prisma directly.

| Page | URL | Content |
|------|-----|---------|
| Dashboard | `/admin` | Overview stats |
| Users | `/admin/users` | Manage all users |
| Trips | `/admin/trips` | All trips + knowledge cards |
| Matches | `/admin/matches` | Matched pairs + waypoint progress |
| Alerts | `/admin/alerts` | Overdue waypoint alerts |
| SangPoints | `/admin/sangpoints` | On-chain ledger + tx hashes |
| Firebase Logs | `/admin/firebase-logs` | Notification history |

---

## Blockchain Integration

**Contract:** `SangPoints.sol` — ERC-20 token on Polygon Amoy testnet

**Bridge file** (`lib/sangpoints.ts`):
- `mintPoints(walletAddress, 200)` — called on trip completion
- `getBalance(walletAddress)` — called for profile screen
- Transaction hash saved to Supabase `SangPointsLedger`

---

## Firebase Push Notifications

Four trigger moments:
1. **Match accepted** → notify trekker
2. **Departure confirmed** → notify both parties
3. **Waypoint overdue** → alert emergency contacts
4. **Trip completed safely** → notify both parties

---

## Authentication Strategy

- **Mobile users** — JWT issued at login, sent as `Bearer` token in every request header
- **Admin users** — separate JWT with `role: admin`, verified by `middleware.ts` protecting all `/admin` routes

---

## Demo Seed Data

Two seed scripts (`npx prisma db seed`):
1. **Aarav** (Guide, Mardi Himal, June 14–17) + **Leon** (German trekker, emergency contact set)
2. **Mardi Himal Route**: Pokhara (6h) → Kande (8h) → Forest Camp (12h) → Mardi Base Camp (16h)
3. Demo wallet pre-loaded with 500 SangPoints on Amoy

---

## Deployment

| Component | Platform |
|-----------|----------|
| Backend + Admin | Vercel (one command) |
| Mobile App | Expo EAS Build |
| Smart Contract | Polygon Amoy via Hardhat |
| Cron Job | Vercel built-in cron (vercel.json) |

---

## Team Division

| Member | Owns |
|--------|------|
| 🔗 Blockchain | `sangsangai-blockchain/`, `lib/sangpoints.ts`, demo wallet on Amoy |
| ⚙️ Backend | `app/api/`, `lib/firebase.ts`, `lib/prisma.ts`, seed scripts, cron |
| 📱 Frontend | `sangsangai-mobile/`, optionally `app/admin/` pages |

---

## Implementation Phases

- [x] Phase 0 — Project summary & architecture design
- [x] Phase 1 — Repository scaffolding (Next.js + Expo + Hardhat)
- [ ] Phase 2 — Database schema + Prisma migration
- [ ] Phase 3 — Auth endpoints (register + login)
- [ ] Phase 4 — Trip & Match API endpoints
- [ ] Phase 5 — Waypoint tracking + cron alerts
- [ ] Phase 6 — Blockchain bridge (SangPoints mint/balance)
- [ ] Phase 7 — Firebase notifications
- [ ] Phase 8 — Admin panel pages
- [ ] Phase 9 — Mobile app screens
- [ ] Phase 10 — Seed data + demo setup
- [ ] Phase 11 — Deployment to Vercel + Amoy

---

## Developer Guide & Quick Start Commands

Here is the master list of commands needed to run each of the 3 components locally.

### 1. Next.js Backend (`sangsangai-backend`)
Make sure you are in the `sangsangai-backend` directory.

- **Start Dev Server**: `npm run dev`
- **Install Dependencies**: `npm install`
- **Prisma Setup**: 
  - `npx prisma generate` (Generates Prisma Client)
  - `npx prisma db push` (Pushes schema to Supabase/PostgreSQL)
  - `npx prisma studio` (Opens local GUI for the database)

### 2. Expo Mobile App (`sangsangai-mobile`)
Make sure you are in the `sangsangai-mobile` directory.

- **Start Metro Bundler**: `npx expo start` or `npm run start`
- **Run on iOS Simulator**: `npm run ios`
- **Run on Android Emulator**: `npm run android`
- **Install Dependencies**: `npm install`

### 3. Blockchain (`sangsangai-blockchain`)
Make sure you are in the `sangsangai-blockchain` directory.

- **Compile Contract**: `npx hardhat compile`
- **Run Tests**: `npx hardhat test`
- **Deploy to Local Node**: 
  - First terminal: `npx hardhat node`
  - Second terminal: `npx hardhat run scripts/deploy.ts --network localhost`
- **Deploy to Polygon Amoy Testnet**: `npx hardhat run scripts/deploy.ts --network amoy`

---

*Built with ❤️ for JunctionX Kathmandu 2026*
