
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListOrdered, RefreshCw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const { role } = useAppStore();

  const navItems = [
    { label: "الرئيسية", icon: Home, href: "/" },
    { label: "الطلبات", icon: ListOrdered, href: "/orders" },
    { label: "التدوير", icon: RefreshCw, href: "/rotation" },
  ];

  if (role === "ADMIN" || role === "SUPERVISOR") {
    navItems.push({ label: "الإدارة", icon: ShieldAlert, href: "/admin" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around px-4 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary font-bold" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
