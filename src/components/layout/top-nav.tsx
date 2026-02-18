
"use client";

import { UserCircle, LogOut, ShieldCheck, UserCog, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { useUIStore } from "@/lib/store";
import { signOut } from "firebase/auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export function TopNav() {
  const { user } = useUser();
  const { userRole, setUserRole } = useUIStore();
  const auth = useAuth();

  const handleLogout = () => {
    signOut(auth);
    setUserRole(null);
  };

  const getRoleIcon = () => {
    if (userRole === "ADMIN") return <ShieldCheck className="h-4 w-4 text-primary" />;
    if (userRole === "SUPERVISOR") return <UserCog className="h-4 w-4 text-blue-500" />;
    return <User className="h-4 w-4 text-slate-400" />;
  };

  const getRoleLabel = () => {
    if (userRole === "ADMIN") return "مدير النظام";
    if (userRole === "SUPERVISOR") return "مشرف قسم";
    return "موظف / زائر";
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white text-slate-900 flex items-center justify-between px-4 z-50 shadow-sm border-b border-slate-200">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-1.5 rounded-lg">
          <Image 
            src="https://picsum.photos/seed/banklogo/200/200" 
            alt="Bank Logo" 
            width={24} 
            height={24} 
            className="rounded"
            data-ai-hint="bank logo"
          />
        </div>
        <h1 className="text-xl font-bold text-primary tracking-tight">طلبات</h1>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-slate-100 rounded-full border border-slate-100">
              {getRoleIcon()}
              <span className="text-[10px] font-bold hidden sm:inline">{getRoleLabel()}</span>
              <UserCircle className="h-5 w-5 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                {getRoleIcon()}
                <span>{getRoleLabel()}</span>
              </div>
              <div className="text-[10px] font-normal text-slate-500 mt-1">
                {user?.email || "غير مسجل"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user && (
              <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold">
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            )}
            {!user && (
              <DropdownMenuItem onClick={() => window.location.href = '/login'} className="font-bold text-primary">
                دخول الإدارة
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
