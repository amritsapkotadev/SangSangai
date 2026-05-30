"use client";

import { useState, FormEvent } from "react";
import {
  Mountain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = `/login?token=${encodeURIComponent(data.data.token)}`;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 p-12 lg:flex">
        <div className="absolute left-1/3 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-stone-700/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-green-500/5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/20">
            <Mountain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">SangSangai</span>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-sm text-green-400 backdrop-blur-sm">
            Trekking Safety Platform
          </div>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Connect with confidence
            <br />
            Trek with safety
          </h2>
          <p className="max-w-sm leading-relaxed text-stone-400">
            SangSangai connects Nepali guides with trekkers, tracks progress in
            real-time, and rewards safe completions with blockchain-backed
            SangPoints.
          </p>
        </div>

        <div className="relative z-10 text-sm text-stone-500">
          &copy; 2026 SangSangai. All rights reserved.
        </div>
      </div>

      <div className="flex w-full flex-col bg-gradient-to-br from-white via-stone-50 to-stone-100 dark:from-background dark:via-muted/30 dark:to-background lg:w-1/2">
        <header className="flex items-center justify-between border-b bg-white/50 px-6 py-4 backdrop-blur-sm dark:bg-card lg:px-10">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold">SangSangai</h1>
              <p className="text-xs text-muted-foreground">SangSangai</p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/20 lg:hidden">
                <Mountain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    disabled={loading}
                    className="border-stone-200 pl-10 transition-colors placeholder:text-stone-400 focus:border-green-500 focus:ring-green-500/20 dark:border-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="border-stone-200 pl-10 pr-10 transition-colors placeholder:text-stone-400 focus:border-green-500 focus:ring-green-500/20 dark:border-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/30"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
