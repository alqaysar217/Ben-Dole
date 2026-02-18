"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, RefreshCw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const { userRole } = useUIStore();

  const navItems = [
    { label: "الرئيسية", icon: LayoutDashboard, href: "/order" },
    { label: "الطلبات", icon: ListOrdered, href: "/orders" },
    { label: "التدوير", icon: RefreshCw, href: "/rotation" },
  ];

  if (userRole === "ADMIN" || userRole === "SUPERVISOR") {
    navItems.push({ label: "الإدارة", icon: ShieldAlert, href: "/admin" });
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-morphism border-t border-white/20 h-20 flex items-center justify-around px-6 z-50 rounded-t-[32px] premium-shadow">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 transition-all duration-500 relative flex-1 h-full px-1",
              isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {isActive && (
              <div className="absolute top-0 h-1.5 w-8 bg-primary rounded-full animate-in fade-in zoom-in duration-500" />
            )}
            <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
            <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "opacity-100" : "opacity-60")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
