"use client";

import { 
  LogOut, 
  ShieldCheck, 
  UserCog, 
  User, 
  Menu, 
  MessageCircle, 
  Instagram, 
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { useUIStore } from "@/lib/store";
import { signOut } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

export function TopNav() {
  const { user } = useUser();
  const { userRole, setUserRole } = useUIStore();
  const auth = useAuth();

  const handleLogout = () => {
    signOut(auth);
    setUserRole(null);
  };

  const getRoleLabel = () => {
    if (userRole === "ADMIN") return "مدير النظام";
    if (userRole === "SUPERVISOR") return "مشرف قسم";
    return "موظف / زائر";
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass-morphism flex items-center justify-between px-6 z-50 border-b border-white/20 premium-shadow">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="bg-white p-1.5 rounded-2xl premium-shadow border border-white transition-transform group-hover:scale-105">
          <Image 
            src="https://picsum.photos/seed/banklogo/200/200" 
            alt="شعار البنك" 
            width={28} 
            height={28} 
            className="rounded-xl"
            data-ai-hint="شعار البنك"
          />
        </div>
        <h1 className="text-2xl font-black text-primary tracking-tight font-headline">طلبات</h1>
      </Link>

      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 bg-white premium-shadow border border-white text-slate-600 hover:text-primary transition-all active:scale-90">
              <Menu className="h-6 w-6" strokeWidth={2} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0 flex flex-col h-full border-none rounded-l-[32px] premium-shadow overflow-hidden bg-[#F4F6FA]">
            {/* الهيدر المدمج */}
            <div className="p-8 bg-premium-gradient text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-waves opacity-10" />
              <SheetHeader className="text-right relative z-10">
                <SheetTitle className="text-xl font-black text-white font-headline">
                  {getRoleLabel()}
                </SheetTitle>
                <SheetDescription className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate">
                  {user?.email || "لم يتم تسجيل الدخول"}
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* منطقة الأزرار */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">الوصول السريع</p>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/order" className="flex items-center justify-between p-3.5 rounded-2xl bg-white premium-shadow hover:bg-primary/5 transition-all group border border-white">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 p-2 rounded-xl text-green-600"><User className="h-4 w-4" /></div>
                      <span className="font-bold text-sm text-slate-700">دخول كموظف</span>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                  <Link href="/login" className="flex items-center justify-between p-3.5 rounded-2xl bg-white premium-shadow hover:bg-secondary/5 transition-all group border border-white">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><UserCog className="h-4 w-4" /></div>
                      <span className="font-bold text-sm text-slate-700">دخول كمشرف</span>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-300 group-hover:text-secondary transition-colors" />
                  </Link>
                  <Link href="/login" className="flex items-center justify-between p-3.5 rounded-2xl bg-white premium-shadow hover:bg-primary/5 transition-all group border border-white">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-xl text-primary"><ShieldCheck className="h-4 w-4" /></div>
                      <span className="font-bold text-sm text-slate-700">دخول كمدير</span>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              </div>

              {user && (
                <div className="pt-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-black p-3.5 h-auto rounded-2xl gap-3 bg-white premium-shadow border border-white transition-all active:scale-95"
                    onClick={handleLogout}
                  >
                    <div className="bg-red-50 p-2 rounded-xl"><LogOut className="h-4 w-4" /></div>
                    تسجيل الخروج
                  </Button>
                </div>
              )}
            </div>

            {/* قسم المطور المصغر في الأسفل */}
            <div className="p-4 bg-white/40 border-t border-white/50">
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl premium-shadow border border-white">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-800">م/ محمود الحساني</span>
                  <span className="text-[8px] font-bold text-primary uppercase tracking-widest opacity-60">Software Engineer</span>
                </div>
                <div className="flex gap-1.5">
                  <Link href="https://wa.me/967775258830" target="_blank" className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </Link>
                  <Link href="https://instagram.com/mahmoud_codes" target="_blank" className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Instagram className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
