"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Bell, User, LogOut } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Welcome back</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            3
          </span>
        </Button>

        <ModeToggle />

        <Link href="/api/auth/signout">
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
