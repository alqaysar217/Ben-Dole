
"use client";

import { Menu, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

export function TopNav() {
  const { role, setRole, currentUser, setCurrentUser } = useAppStore();

  const handleLogout = () => {
    setCurrentUser(null);
    setRole("EMPLOYEE");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-primary text-primary-foreground flex items-center justify-between px-4 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background text-foreground">
            <SheetHeader>
              <SheetTitle className="text-primary font-bold text-2xl">طلبات البنك</SheetTitle>
            </SheetHeader>
            <div className="mt-8 space-y-4">
              <p className="text-sm text-muted-foreground mb-2">تغيير الدور (لغرض العرض):</p>
              <Button 
                variant={role === "EMPLOYEE" ? "default" : "outline"} 
                className="w-full justify-start" 
                onClick={() => setRole("EMPLOYEE")}
              >
                موظف
              </Button>
              <Button 
                variant={role === "SUPERVISOR" ? "default" : "outline"} 
                className="w-full justify-start" 
                onClick={() => setRole("SUPERVISOR")}
              >
                مشرف قسم (123456)
              </Button>
              <Button 
                variant={role === "ADMIN" ? "default" : "outline"} 
                className="w-full justify-start" 
                onClick={() => setRole("ADMIN")}
              >
                مدير النظام
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <h1 className="text-xl font-bold tracking-tight">طلبات</h1>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground rounded-full hover:bg-white/10">
              <UserCircle className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {currentUser ? `أهلاً، ${currentUser}` : "غير مسجل دخول"}
              <div className="text-[10px] font-normal text-muted-foreground mt-1">
                {role === "ADMIN" ? "مدير النظام" : role === "SUPERVISOR" ? "مشرف" : "موظف"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
