# SangSangai — Detailed Implementation Plan

## Phase 0: Project Scaffolding

**0.1 — Initialize Next.js monorepo**
- `npx create-next-app@latest .` with TypeScript, App Router, Tailwind CSS
- Set up `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- Root `package.json` with `scripts: { dev, build, start, lint }`

**0.2 — Install core dependencies**
- `prisma`, `@prisma/client` — database ORM
- `jsonwebtoken`, `bcryptjs` — auth
- `ethers` — blockchain bridge
- `firebase-admin` — push notifications
- `uuid` — hashed user IDs
- Dev: `@types/jsonwebtoken`, `@types/bcryptjs`

**0.3 — Initialize Prisma + Supabase**
- `npx prisma init` — outputs `prisma/schema.prisma`
- Configure `DATABASE_URL` pointing to Supabase PostgreSQL
- Create `.env.local` with placeholders for all secrets

---

## Phase 1: Database Schema (`prisma/schema.prisma`)

### 1.1 — Define all models:

| Model | Key Fields |
|-------|-----------|
| `User` | `id (uuid)`, `email`, `passwordHash`, `role` ("nepali"/"foreign"/"admin"), `name`, `nationality`, `walletAddress`?, `emergencyContact`?, `hashedId`, `createdAt` |
| `Trip` | `id (uuid)`, `guideId (→User)`, `trekkerId (→User)?`, `routeId (→Route)`, `startDate`, `endDate`, `status` (open/matched/in_progress/completed/cancelled), `createdAt` |
| `Route` | `id (uuid)`, `name`, `description`, `region`, `durationDays` |
| `Waypoint` | `id (uuid)`, `routeId (→Route)`, `name`, `order`, `estimatedHours`, `latitude`, `longitude` |
| `Match` | `id (uuid)`, `guideTripId (→Trip)`, `trekkerTripId (→Trip)`, `status` (pending/accepted/departed/completed), `createdAt`, `departedAt`, `completedAt` |
| `WaypointProgress` | `id (uuid)`, `matchId (→Match)`, `waypointId (→Waypoint)`, `confirmedAt`?, `overdueAlertSent` |
| `SangPointsLedger` | `id (uuid)`, `matchId (→Match)`, `walletAddress`, `amount`, `type` (mint/redeem), `txHash`, `createdAt` |
| `NotificationLog` | `id (uuid)`, `matchId (→Match)?`, `recipientUserId (→User)?`, `type`, `sentAt`, `success` |

### 1.2 — Seed scripts (`prisma/seed.ts`)
- Seed Aarav (Nepali guide) + Leon (German trekker)
- Seed Mardi Himal route + 4 waypoints (Pokhara, Kande, Forest Camp, Mardi Base)
- Seed demo wallet with 500 pre-minted SangPoints

---

## Phase 2: Core Library Files (`lib/`)

### 2.1 — `lib/prisma.ts`
Prisma client singleton.

### 2.2 — `lib/firebase.ts`
Firebase Admin SDK init. Export `admin.messaging()`. Helper: `sendPushNotification(deviceToken, title, body)`.

### 2.3 — `lib/sangpoints.ts`
Blockchain bridge using ethers.js. Connect to Polygon Amoy testnet. Functions:
- `mintPoints(walletAddress, amount) → txHash`
- `getBalance(walletAddress) → number`

### 2.4 — `lib/auth.ts`
JWT helpers:
- `signToken(payload) → string`
- `verifyToken(token) → payload`
- `hashPassword(plain) → hash`, `comparePassword(plain, hash) → boolean`
- `authMiddleware(request)` — extracts Bearer token, verifies, attaches user to request
- `adminMiddleware(request)` — same but checks `role === 'admin'`

### 2.5 — `lib/types.ts`
Shared TypeScript types/interfaces.

---

## Phase 3: API Routes (`app/api/`)

### 3.1 — Authentication
- `POST /api/auth/register` — validate email, hash password, hash ID, create user, return JWT
- `POST /api/auth/login` — find user by email, compare password, return JWT

### 3.2 — User endpoints
- `GET /api/users/me` — return profile from JWT sub
- `GET /api/users/me/sangpoints` — call `getBalance(walletAddress)`, return live balance

### 3.3 — Trip endpoints
- `POST /api/trips` — create trip, auto-assign waypoints from route
- `GET /api/trips/matches` — browse trips by destination/dates with filters
- `GET /api/trips/[id]/knowledge-card` — trekker reads guide's itinerary
- `POST /api/trips/[id]/knowledge-card` — guide writes/updates itinerary

### 3.4 — Match endpoints
- `POST /api/matches` — send connection request
- `PUT /api/matches/[id]/accept` — validate role, update status, send Firebase notification
- `PUT /api/matches/[id]/depart` — both confirm departure, record timestamp, send notification

### 3.5 — Waypoint endpoints
- `POST /api/waypoints/[id]/confirm` — create WaypointProgress, check overdue, alert emergency contacts

### 3.6 — Trip completion
- `PUT /api/matches/[id]/complete` — validate all waypoints confirmed, call `mintPoints(wallet, 200)`, save tx hash to ledger, send notification

### 3.7 — Cron route (`app/api/cron/check-overdue/route.ts`)
- Every 30 min: query active matches without completion
- Check last confirmed waypoint's estimated hours vs elapsed time
- If overdue: send Firebase push to emergency contact, log in NotificationLog
- Config in `vercel.json` under `crons`

---

## Phase 4: Admin Panel (`app/admin/`)

### 4.1 — Middleware (`middleware.ts`)
- Matches `/admin/:path*`
- Reads JWT from cookie or Authorization header
- Verifies `role === 'admin'`, redirects on failure

### 4.2 — Admin pages
- `app/admin/login/page.tsx` — simple form, issues admin JWT
- `app/admin/page.tsx` — dashboard overview (counts)
- `app/admin/users/page.tsx` — table of users with verify/ban
- `app/admin/trips/page.tsx` — trips list with status, knowledge card preview
- `app/admin/matches/page.tsx` — matched pairs, waypoint progress
- `app/admin/alerts/page.tsx` — overdue alerts, emergency contacts notified
- `app/admin/sangpoints/page.tsx` — ledger with blockchain tx hashes
- `app/admin/notifications/page.tsx` — push notification log

### 4.3 — Admin layout (`app/admin/layout.tsx`)
- Sidebar navigation, header, logout button

---

## Phase 5: Expo Mobile App (separate repo or directory)

### 5.1 — Scaffold
- `npx create-expo-app@latest sangsangai-mobile`
- Install: `expo-router`, `@react-navigation`, `axios`, `async-storage`, `expo-notifications`

### 5.2 — Auth screens
- Login screen (email + password → JWT stored in AsyncStorage)
- Register screen (role selection, details form)

### 5.3 — Main screens (trekker flow)
- Home/dashboard — list available trips near destination
- Trip detail — view route, waypoints, guide profile
- Match request — send connection request
- Active trip — live waypoint progress, confirm arrival
- Profile — SangPoints balance

### 5.4 — Main screens (guide flow)
- Dashboard — manage trips, view incoming match requests
- Create trip — select route, set dates
- Write knowledge card — free-form itinerary text
- Active trip management — confirm departure, mark waypoints

### 5.5 — Shared components
- `api/client.ts` — Axios instance with `API_BASE_URL` and JWT interceptor
- Navigation setup with expo-router
- Push notification handler (register device token)

---

## Phase 6: DevOps & Deployment

### 6.1 — `vercel.json`
```json
{
  "crons": [
    { "path": "/api/cron/check-overdue", "schedule": "*/30 * * * *" }
  ]
}
```

### 6.2 — Environment variables checklist
| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Supabase |
| `JWT_SECRET` | Generated |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Console |
| `BLOCKCHAIN_RPC_URL` | Amoy RPC |
| `CONTRACT_ADDRESS` | Deployed contract |
| `PRIVATE_KEY` | Deployer wallet |
| `NEXT_PUBLIC_API_URL` | Vercel URL (mobile app) |

### 6.3 — Deployment order
1. Deploy SangPoints contract to Polygon Amoy
2. Push Next.js project to Vercel
3. Set all env vars in Vercel dashboard
4. Run `npx prisma db push`
5. Run seed scripts
6. Build and publish Expo app

---

## Team Member Responsibilities

| Member | Scope |
|--------|-------|
| **Blockchain** | `lib/sangpoints.ts` + deploy contract on Amoy + fund demo wallet |
| **Backend** | All `app/api/*` routes + `lib/prisma.ts` + `lib/firebase.js` + seeds + cron |
| **Frontend** | Expo mobile app + optionally admin panel pages |

---

## Key Architectural Decisions

- No Express server — Next.js Route Handlers handle all API logic
- Single Prisma client shared across API and admin pages
- Admin panel is server-rendered (no extra API calls within same process)
- Mobile app is fully decoupled — just calls HTTP endpoints
- Every route handler wraps with `authMiddleware` or `adminMiddleware`
- One codebase, one deployment, one set of environment variables
