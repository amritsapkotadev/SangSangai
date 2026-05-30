import Link from "next/link";
import { Mountain, MapPin, Shield, Coins, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <Mountain className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold">SangSangai</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#blockchain" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Blockchain
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-background" />
        <div className="container relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="mr-2 h-2 w-2 rounded-full bg-accent animate-pulse" />
            JunctionX Kathmandu 2026 — Heritage & Culture
          </div>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Trek Nepal with
            <span className="block text-accent">Confidence & Rewards</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            SangSangai connects Nepali trekking guides with foreign adventurers, tracks every
            waypoint in real-time, and rewards safe journeys with SangPoints on the Polygon blockchain.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button size="xl" className="gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="xl" variant="outline" className="gap-2">
              Watch Demo
            </Button>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-accent">200+</p>
              <p className="text-sm text-muted-foreground">SangPoints per Trek</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">4</p>
              <p className="text-sm text-muted-foreground">Waypoint Checks</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">30min</p>
              <p className="text-sm text-muted-foreground">Alert Response</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why SangSangai?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built for the mountains, powered by blockchain.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "Waypoint Tracking",
                description: "Real-time location check-ins at every major stop along the trek. Emergency contacts are notified if a waypoint is missed.",
              },
              {
                icon: Shield,
                title: "Safety First",
                description: "Automatic overdue alerts fire every 30 minutes. Emergency contacts get instant push notifications if a trekker goes missing.",
              },
              {
                icon: Coins,
                title: "SangPoints Rewards",
                description: "Nepali guides earn 200 SangPoints per completed trek. Points are minted on Polygon Amoy and visible in the admin ledger.",
              },
              {
                icon: Users,
                title: "Guide-Trekker Matching",
                description: "Browse trips by destination and dates. Connect with certified Nepali guides for a safe, authentic experience.",
              },
              {
                icon: Mountain,
                title: "Knowledge Cards",
                description: "Guides share detailed itineraries and local wisdom. Trekkers get insider knowledge before they arrive.",
              },
              {
                icon: MapPin,
                title: "Live Dashboard",
                description: "Admin panel shows every active trip, match status, waypoint progress, and blockchain transaction in real time.",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t bg-muted/30 py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              From connection to completion — the full journey.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Register", description: "Sign up as a Nepali guide or foreign trekker. Get verified and set up your profile." },
              { step: "02", title: "Match", description: "Browse available trips. Send a connection request and confirm your match." },
              { step: "03", title: "Trek", description: "Depart together, check in at waypoints, and enjoy the journey." },
              { step: "04", title: "Earn", description: "Complete the trek safely. Guides earn 200 SangPoints minted on-chain." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="blockchain" className="border-t py-24">
        <div className="container">
          <div className="mx-auto grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center rounded-full border bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
                Polygon Amoy Testnet
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Rewards on the Blockchain
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Every completed trek mints 200 SangPoints directly to the guide&apos;s wallet
                on Polygon Amoy. The admin panel tracks every transaction with its
                blockchain hash — fully transparent and verifiable.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "ERC-20 compatible SangPoints token",
                  "Minted automatically on trip completion",
                  "Transaction hashes logged in Supabase",
                  "Live balance checking via the mobile app",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-sm text-muted-foreground">Contract</span>
                  <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                    0x742d...44e
                  </code>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <span className="text-sm font-medium">Polygon Amoy</span>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <span className="text-sm text-muted-foreground">Token Supply</span>
                  <span className="text-sm font-medium">1,000,000 SP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reward per Trek</span>
                  <span className="text-lg font-bold text-accent">200 SP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Mountain className="h-5 w-5 text-accent" />
              <span className="font-semibold">SangSangai</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built by Team TECDEVx — JunctionX Kathmandu 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
