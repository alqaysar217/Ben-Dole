
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListOrdered, RefreshCw, ShieldAlert, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { label: "البداية", icon: Home, href: "/" },
    { label: "الطلب", icon: ShoppingBag, href: "/order" },
    { label: "الطلبات", icon: ListOrdered, href: "/orders" },
    { label: "التدوير", icon: RefreshCw, href: "/rotation" },
  ];

  if (user) {
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
