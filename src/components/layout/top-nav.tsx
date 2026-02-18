"use client";

import { 
  LogOut, 
  ShieldCheck, 
  UserCog, 
  User, 
  Menu, 
  MessageCircle, 
  Instagram, 
  ExternalLink,
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
import { Separator } from "@/components/ui/separator";

export function TopNav() {
  const { user } = useUser();
  const { userRole, setUserRole } = useUIStore();
  const auth = useAuth();

  const handleLogout = () => {
    signOut(auth);
    setUserRole(null);
  };

  const getRoleIcon = () => {
    if (userRole === "ADMIN") return <ShieldCheck className="h-5 w-5 text-primary" />;
    if (userRole === "SUPERVISOR") return <UserCog className="h-5 w-5 text-blue-500" />;
    return <User className="h-5 w-5 text-slate-400" />;
  };

  const getRoleLabel = () => {
    if (userRole === "ADMIN") return "مدير النظام";
    if (userRole === "SUPERVISOR") return "مشرف قسم";
    return "موظف / زائر";
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white text-slate-900 flex items-center justify-between px-4 z-50 shadow-sm border-b border-slate-200">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
      </Link>

      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-slate-100">
              <Menu className="h-6 w-6 text-slate-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 flex flex-col h-full border-l">
            {/* Header Info */}
            <div className="p-6 bg-slate-50 border-b">
              <SheetHeader className="text-right">
                <SheetTitle className="flex items-center gap-3 text-primary text-2xl font-black">
                  {getRoleIcon()}
                  {getRoleLabel()}
                </SheetTitle>
                <SheetDescription className="text-slate-500 text-xs mt-1 truncate">
                  {user?.email || "غير مسجل"}
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">الدخول كـ</p>
                <Link href="/order" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600"><User className="h-5 w-5" /></div>
                    <span className="font-bold text-slate-700">موظف</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                </Link>
                <Link href="/login" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><UserCog className="h-5 w-5" /></div>
                    <span className="font-bold text-slate-700">مشرف قسم</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                </Link>
                <Link href="/login" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary"><ShieldCheck className="h-5 w-5" /></div>
                    <span className="font-bold text-slate-700">مدير النظام</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                </Link>
              </div>

              <Separator className="my-4 mx-4 w-auto" />

              {/* Logout Option */}
              {user && (
                <div className="px-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 font-bold p-3 h-auto rounded-xl gap-3"
                    onClick={handleLogout}
                  >
                    <div className="bg-destructive/10 p-2 rounded-lg"><LogOut className="h-5 w-5" /></div>
                    تسجيل الخروج
                  </Button>
                </div>
              )}
            </div>

            {/* Developer Contact Footer */}
            <div className="p-6 bg-slate-50 border-t mt-auto">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">تواصل مع المطور</p>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">م/ محمود الحساني</span>
                  <span className="text-[10px] text-slate-500">Fullstack Web Developer</span>
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    href="https://wa.me/967775258830" 
                    target="_blank" 
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white p-2 rounded-xl hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-[10px] font-bold">واتساب</span>
                  </Link>
                  <Link 
                    href="https://instagram.com/mahmoud_codes" 
                    target="_blank" 
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white p-2 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="h-4 w-4" />
                    <span className="text-[10px] font-bold">إنستجرام</span>
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