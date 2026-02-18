
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListOrdered, RefreshCw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const { userRole } = useUIStore();

  // العناصر الأساسية التي تظهر للجميع (الموظفين والزوار)
  const navItems = [
    { label: "الرئيسية", icon: Home, href: "/" },
    { label: "الطلبات", icon: ListOrdered, href: "/orders" },
    { label: "التدوير", icon: RefreshCw, href: "/rotation" },
  ];

  // يظهر تبويب الإدارة فقط للمدير أو المشرف المسجل دخوله
  if (userRole === "ADMIN" || userRole === "SUPERVISOR") {
    navItems.push({ label: "الإدارة", icon: ShieldAlert, href: "/admin" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around px-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 h-full px-1",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-slate-600"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
            <span className={cn("text-[9px] font-bold whitespace-nowrap", isActive ? "opacity-100" : "opacity-80")}>
              {item.label}
            </span>
            {isActive && <div className="h-1 w-4 bg-primary rounded-full mt-0.5" />}
          </Link>
        );
      })}
    </nav>
  );
}
