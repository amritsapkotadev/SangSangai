import https from "https";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

const NEON_IP = "35.168.64.81";

neonConfig.fetchFunction = (
  url: string | URL | Request,
  opts?: RequestInit
): Promise<Response> => {
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
          try {
            json = JSON.parse(text);
          } catch {
            /* empty */
          }
          const h = Object.fromEntries(
            Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), v])
          );
          resolve({
            status: res.statusCode ?? 200,
            statusText: res.statusMessage ?? "",
            ok:
              (res.statusCode ?? 200) >= 200 &&
              (res.statusCode ?? 200) < 300,
            headers: {
              get: (name: string) => (h[name.toLowerCase()] as string) ?? null,
              has: (name: string) => name.toLowerCase() in h,
              forEach: (cb: (v: string, k: string) => void) =>
                Object.entries(h).forEach(([k, v]) => cb(v as string, k)),
              entries: () =>
                Object.entries(h)[Symbol.iterator]() as IterableIterator<
                  [string, string]
                >,
              keys: () =>
                Object.keys(h)[Symbol.iterator]() as IterableIterator<string>,
              values: () =>
                Object.values(h)[Symbol.iterator]() as IterableIterator<string>,
            } as unknown as Headers,
            body: null,
            bodyUsed: false,
            url: url as string,
            redirected: false,
            type: "basic" as ResponseType,
            json: () =>
              json
                ? Promise.resolve(json)
                : Promise.reject(new Error("Response is not JSON")),
            text: () => Promise.resolve(text),
            arrayBuffer: () =>
              Promise.resolve(
                buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
              ),
            blob: () => Promise.reject(new Error("not implemented")),
            formData: () => Promise.reject(new Error("not implemented")),
            clone() {
              return this;
            },
          } as Response);
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    if (body) req.write(body);
    req.end();
  });
};

neonConfig.poolQueryViaFetch = true;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
