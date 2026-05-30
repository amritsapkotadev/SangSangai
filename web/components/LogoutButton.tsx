"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
