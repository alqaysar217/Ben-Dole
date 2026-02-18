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
          <SheetContent side="right" className="w-[320px] p-0 flex flex-col h-full border-none rounded-l-[40px] premium-shadow overflow-hidden bg-[#F4F6FA]">
            {/* الهيدر مع الموجات */}
            <div className="p-10 bg-premium-gradient text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-waves opacity-20" />
              <SheetHeader className="text-right relative z-10 space-y-4">
                <div>
                  <SheetTitle className="text-3xl font-black text-white font-headline">
                    {getRoleLabel()}
                  </SheetTitle>
                  <SheetDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                    {user?.email || "لم يتم تسجيل الدخول"}
                  </SheetDescription>
                </div>
              </SheetHeader>
            </div>

            {/* منطقة المحتوى */}
            <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8">
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">تغيير الصلاحية</p>
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/order" className="flex items-center justify-between p-4 rounded-[22px] bg-white premium-shadow hover:bg-primary/5 transition-all group border border-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-50 p-2.5 rounded-xl text-green-600"><User className="h-5 w-5" strokeWidth={1.5} /></div>
                      <span className="font-bold text-slate-700">دخول كموظف</span>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                  <Link href="/login" className="flex items-center justify-between p-4 rounded-[22px] bg-white premium-shadow hover:bg-secondary/5 transition-all group border border-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600"><UserCog className="h-5 w-5" strokeWidth={1.5} /></div>
                      <span className="font-bold text-slate-700">دخول كمشرف قسم</span>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-slate-300 group-hover:text-secondary transition-colors" />
                  </Link>
                  <Link href="/login" className="flex items-center justify-between p-4 rounded-[22px] bg-white premium-shadow hover:bg-primary/5 transition-all group border border-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2.5 rounded-xl text-primary"><ShieldCheck className="h-5 w-5" strokeWidth={1.5} /></div>
                      <span className="font-bold text-slate-700">دخول كمدير للنظام</span>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              </div>

              {user && (
                <div className="px-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-black p-4 h-auto rounded-[22px] gap-4 bg-white premium-shadow border border-white transition-all active:scale-95"
                    onClick={handleLogout}
                  >
                    <div className="bg-red-50 p-2.5 rounded-xl"><LogOut className="h-5 w-5" /></div>
                    تسجيل الخروج الآمن
                  </Button>
                </div>
              )}
            </div>

            {/* قسم المطور */}
            <div className="p-8 bg-white/50 backdrop-blur-md border-t border-white">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">التواصل مع المطور</p>
              <div className="bg-white p-6 rounded-[28px] premium-shadow border border-white space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-800">م/ محمود الحساني</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">مهندس برمجيات</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href="https://wa.me/967775258830" 
                    target="_blank" 
                    className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-2xl hover:bg-green-600 transition-all premium-shadow active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs font-bold">واتساب</span>
                  </Link>
                  <Link 
                    href="https://instagram.com/mahmoud_codes" 
                    target="_blank" 
                    className="flex items-center justify-center gap-2 bg-premium-gradient text-white py-3 rounded-2xl hover:opacity-90 transition-all premium-shadow active:scale-95"
                  >
                    <Instagram className="h-4 w-4" />
                    <span className="text-xs font-bold">إنستجرام</span>
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
