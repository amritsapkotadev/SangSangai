import "dotenv/config";
import https from "https";
import { neon, neonConfig } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const NEON_IP = "35.168.64.81";
neonConfig.fetchFunction = (url: string | URL | Request, opts?: RequestInit) => {
  const u = new URL(url as string);
  return new Promise((resolve, reject) => {
    const body = opts?.body as string | undefined;
    const req = https.request(
      {
        hostname: NEON_IP,
        port: 443,
        path: u.pathname + u.search,
        method: (opts?.method as string) || "GET",
        headers: (opts?.headers as Record<string, string>) || {},
        servername: u.hostname,
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          const text = buf.toString();
          let json: unknown;
          try { json = JSON.parse(text); } catch { /* empty */ }
          const h = Object.fromEntries(
            Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), v])
          );
          resolve({
            status: res.statusCode ?? 200,
            statusText: res.statusMessage ?? "",
            ok: (res.statusCode ?? 200) >= 200 && (res.statusCode ?? 200) < 300,
            headers: {
              get: (name: string) => (h[name.toLowerCase()] as string) ?? null,
              has: (name: string) => name.toLowerCase() in h,
              forEach: (cb: (v: string, k: string) => void) => Object.entries(h).forEach(([k, v]) => cb(v as string, k)),
              entries: () => Object.entries(h)[Symbol.iterator]() as IterableIterator<[string, string]>,
              keys: () => Object.keys(h)[Symbol.iterator]() as IterableIterator<string>,
              values: () => Object.values(h)[Symbol.iterator]() as IterableIterator<string>,
            } as unknown as Headers,
            body: null, bodyUsed: false, url: url as string, redirected: false, type: "basic" as ResponseType,
            json: () => json ? Promise.resolve(json) : Promise.reject(new Error("no json")),
            text: () => Promise.resolve(text),
            arrayBuffer: () => Promise.resolve(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)),
            blob: () => Promise.reject(new Error("nope")),
            formData: () => Promise.reject(new Error("nope")),
            clone() { return this; },
          } as Response);
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("timeout")); });
    if (body) req.write(body);
    req.end();
  });
};

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  await sql`DELETE FROM "NotificationLog"`;
  await sql`DELETE FROM "SangPointsLedger"`;
  await sql`DELETE FROM "WaypointProgress"`;
  await sql`DELETE FROM "Match"`;
  await sql`DELETE FROM "KnowledgeCard"`;
  await sql`DELETE FROM "Trip"`;
  await sql`DELETE FROM "Waypoint"`;
  await sql`DELETE FROM "Route"`;
  await sql`DELETE FROM "User"`;

  const [aarav] = await sql`
    INSERT INTO "User" (id, email, "passwordHash", name, role, nationality, "walletAddress", phone, "hashedId", "isVerified", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${"aarav@example.com"}, ${passwordHash}, ${"Aarav Gurung"}, ${"NEPALI"}, ${"Nepali"}, ${"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18"}, ${"+977-9841234567"}, ${"a1b2c3d4e5f6g7h8"}, ${true}, ${new Date().toISOString()})
    RETURNING id, name
  `;

  const [leon] = await sql`
    INSERT INTO "User" (id, email, "passwordHash", name, role, nationality, "emergencyContact", "emergencyPhone", phone, "hashedId", "isVerified", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${"leon@example.com"}, ${passwordHash}, ${"Leon M\u00fcller"}, ${"FOREIGN"}, ${"German"}, ${"Anna M\u00fcller"}, ${"+49-1712345678"}, ${"+977-9809876543"}, ${"i9j8k7l6m5n4o3p2"}, ${true}, ${new Date().toISOString()})
    RETURNING id, name
  `;

  const [admin] = await sql`
    INSERT INTO "User" (id, email, "passwordHash", name, role, "hashedId", "isVerified", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${"admin@sangsangai.com"}, ${passwordHash}, ${"Admin"}, ${"ADMIN"}, ${"admin_secret_hash_001"}, ${true}, ${new Date().toISOString()})
    RETURNING id, name
  `;

  await sql`
    INSERT INTO "Route" (id, name, description, region, "durationDays", difficulty, "imageUrl")
    VALUES (${"mardi-himal-route"}, ${"Mardi Himal Trek"}, ${"A stunning trek to Mardi Himal Base Camp with panoramic views of the Annapurna range."}, ${"Annapurna"}, ${4}, ${"moderate"}, ${"/routes/mardi-himal.jpg"})
  `;

  const waypoints = [
    { name: "Pokhara", order: 1, hours: 6, lat: 28.2096, lng: 83.9856, desc: "Starting point \u2014 drive to Kande" },
    { name: "Kande", order: 2, hours: 8, lat: 28.2833, lng: 83.8833, desc: "Trek to Australian Camp" },
    { name: "Forest Camp", order: 3, hours: 12, lat: 28.3167, lng: 83.8667, desc: "Overnight at Forest Camp" },
    { name: "Mardi Base", order: 4, hours: 16, lat: 28.35, lng: 83.85, desc: "Mardi Himal Base Camp" },
  ];

  for (const wp of waypoints) {
    await sql`
      INSERT INTO "Waypoint" (id, "routeId", name, "order", "estimatedHours", latitude, longitude, description)
      VALUES (${`mardi-wp-${wp.order}`}, ${"mardi-himal-route"}, ${wp.name}, ${wp.order}, ${wp.hours}, ${wp.lat}, ${wp.lng}, ${wp.desc})
    `;
  }

  await sql`
    INSERT INTO "Trip" (id, "guideId", "routeId", "startDate", "endDate", status, "updatedAt")
    VALUES (${"aarav-mardi-june"}, ${aarav.id}, ${"mardi-himal-route"}, ${new Date("2026-06-14").toISOString()}, ${new Date("2026-06-17").toISOString()}, ${"OPEN"}, ${new Date().toISOString()})
  `;

  await sql`
    INSERT INTO "KnowledgeCard" (id, "tripId", content, "updatedAt")
    VALUES (${crypto.randomUUID()}, ${"aarav-mardi-june"}, ${`Welcome to the Mardi Himal Trek!

Here's your itinerary:

Day 1 \u2014 Pokhara to Kande (6hrs)
We'll start early from Lakeside Pokhara. Drive to Kande, then trek to Australian Camp for stunning sunset views.

Day 2 \u2014 Kande to Forest Camp (8hrs)
A beautiful walk through rhododendron forests. We'll stop at Pothana for lunch.

Day 3 \u2014 Forest Camp to Mardi Base (12hrs)
The most challenging day. We'll ascend to Badal Danda and then push to Mardi Himal Base Camp.

Day 4 \u2014 Return to Pokhara (6hrs)
Descend via the same route. We'll celebrate with dal bhat in Pokhara!

What to bring:
- Warm layers (it gets cold at Base Camp)
- Good trekking shoes
- Water purification tablets
- A sense of adventure!`}, ${new Date().toISOString()})
  `;

  await sql`
    INSERT INTO "Trip" (id, "guideId", "trekkerId", "routeId", "startDate", "endDate", status, "updatedAt")
    VALUES (${"leon-mardi-june"}, ${leon.id}, ${leon.id}, ${"mardi-himal-route"}, ${new Date("2026-06-14").toISOString()}, ${new Date("2026-06-17").toISOString()}, ${"OPEN"}, ${new Date().toISOString()})
  `;

  console.log("Seed completed!");
  console.log(`- ${[aarav.name, leon.name, admin.name].join(", ")} users created`);
  console.log("- Mardi Himal Trek route with 4 waypoints");
  console.log("- Demo trips: aarav-mardi-june, leon-mardi-june");
  console.log("\nDemo logins:");
  console.log("  Admin: admin@sangsangai.com / password123");
  console.log("  Aarav: aarav@example.com / password123");
  console.log("  Leon:  leon@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
