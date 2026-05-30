JunctionXkathmandu hackathon 2026
Theme: Heritage and Culture
Team: TECDEVx

What we're building
SangSangai is a trekking safety app that connects Nepali guides with foreign trekkers, tracks their journey through waypoints, alerts emergency contacts if someone goes missing, and rewards Nepali guides with SangPoints on the Polygon blockchain. The entire backend — for the mobile app, the admin panel, and the web — runs on a single Next.js project.

Why Next.js as the unified backend
The original plan had a separate Express/Node.js server. Moving to Next.js means one codebase handles everything: the API (via Route Handlers), the admin dashboard (via Next.js pages), and optionally a public marketing site. The mobile app (React Native/Expo) simply calls the Next.js API endpoints over HTTP, exactly as it would call Express. Nothing changes on the mobile side — only the server changes.

Project structure
One Next.js repo with three distinct zones:
app/api/ — all REST endpoints consumed by the mobile app. This replaces the entire Express server.
app/admin/ — the admin panel, built as protected Next.js pages. Only accessible with an admin JWT or session.
app/(public)/ — optional landing page and marketing content.

Database and infrastructure
Supabase (PostgreSQL) remains the database, connected via Prisma. Nothing changes here. The same schema — users, trips, matches, routes, waypoints, sangpoints ledger — works identically. The blockchain bridge file (sangpoints.js using ethers.js) is dropped into the Next.js project as a utility and called from the relevant route handlers.

API layer — what the mobile app calls
Every endpoint the mobile app needs is a Next.js Route Handler. These map directly to what the original Express server was doing:
POST /api/auth/register — register Nepali or foreign user, hash ID, return JWT
POST /api/auth/login — email and password login, return JWT
GET /api/users/me — return profile of logged-in user from JWT
POST /api/trips — create a trip, auto-assign waypoints from the route
GET /api/trips/matches — browse trips matching destination and dates
POST /api/matches — send a connection request
PUT /api/matches/[id]/accept — accept a match, fire Firebase notification
PUT /api/matches/[id]/depart — both groups confirm departure, record on blockchain
POST /api/waypoints/[id]/confirm — confirm reaching a waypoint, alert emergency contacts
PUT /api/matches/[id]/complete — complete trip, mint 200 SangPoints to Nepali wallet
GET/POST /api/trips/[id]/knowledge-card — Nepali guide writes itinerary, foreign trekker reads it after match
The cron job for waypoint overdue alerts runs as a Next.js cron route or via Vercel's built-in cron scheduler, checking every 30 minutes and firing Firebase push notifications.

Admin panel — what the admin sees
The admin panel lives at /admin and is protected by a separate middleware that checks for an admin role in the JWT. It is a set of Next.js server-rendered pages that call the same Prisma client and display data directly — no extra API calls needed since it runs server-side in the same project.
Admin can see and manage:
Users — view all registered users, verify or ban accounts, see Nepali vs foreign breakdown
Trips — see all active and completed trips, view knowledge cards, check trip status
Matches — see all matched pairs, their current waypoint progress, departure times
Waypoint alerts — see which trips have triggered overdue alerts and which emergency contacts were notified
SangPoints ledger — see all minting and redeeming transactions with blockchain hashes
Firebase logs — see which push notifications were sent and to whom

Blockchain integration
The sangpoints.js bridge file sits in lib/sangpoints.js inside the Next.js project. The route handler for trip completion calls mintPoints(walletAddress, 200), receives the transaction hash, and saves it to the sangpoints ledger table in Supabase. The admin panel reads this ledger to show the judge a live view of on-chain activity. The profile screen on the mobile app calls GET /api/users/me/sangpoints which internally calls getBalance(walletAddress) from the bridge file and returns the live number from the Polygon Amoy chain.

Firebase push notifications
Firebase Admin SDK is initialized once in lib/firebase.js inside the Next.js project. Every route handler that needs to fire a notification imports this and calls it directly. Notifications fire at four moments: match accepted, departure confirmed, waypoint overdue alert, and trip completed safely. The admin panel shows a log of all sent notifications.

Authentication strategy
Mobile app users — JWT issued at login, sent as a Bearer token in every request header, verified in a middleware wrapper around each route handler.
Admin users — separate JWT with role: admin, verified by a Next.js middleware in middleware.ts that protects all /admin routes. Admin accounts are seeded manually in the database, not registered through the app.

Demo data
Two seed scripts run via npx prisma db seed:
First script creates Aarav (Nepali, Mardi Himal trip June 14–17, knowledge card pre-filled) and Leon (German, matching trip, emergency contact set).
Second script creates the Mardi Himal route with four waypoints: Pokhara at 6 hours, Kande at 8 hours, Forest Camp at 12 hours, Mardi Base at 16 hours.
The demo wallet on MetaMask Amoy is pre-loaded with 500 SangPoints by calling mintPoints once before the demo.

Deployment
The entire project deploys to Vercel in one command. Environment variables — Supabase connection string, JWT secret, Firebase service account JSON, blockchain private key, contract address — all go into Vercel's environment settings. The cron job is configured in vercel.json. The mobile app's API_BASE_URL is set to the Vercel deployment URL.

What each team member owns
Blockchain friend — lib/sangpoints.js, the deployed contract on Amoy, the demo wallet. Hands the bridge file to the Next.js project once tested.
Backend friend — all files under app/api/, lib/firebase.js, lib/prisma.js, the seed scripts, and the cron route. This is the bulk of the Next.js backend work.
Frontend friend — the React Native app in a separate repo. Calls the Next.js API URLs. Also optionally helps with the admin panel pages under app/admin/ since they use React.

Key advantage of this approach
One deployment, one codebase, one set of environment variables. The admin panel and the mobile API share the same Prisma client, the same Firebase instance, and the same blockchain bridge — so there is no duplication and no sync issues between a separate backend and a separate admin server. Judges see a polished admin dashboard and a working mobile app both powered by the same system.