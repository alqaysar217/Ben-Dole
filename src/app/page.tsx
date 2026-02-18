"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, ShieldCheck, UserCog, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // إخفاء شاشة الترحيب بعد 2.5 ثانية لإعطاء شعور بالتطبيق الأصلي
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setShowSplash(false), 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-in-out",
        fadeOut ? "opacity-0" : "opacity-100"
      )}>
        <div className="relative">
          <div className="absolute -inset-8 bg-primary/10 rounded-full animate-ping duration-1000" />
          <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-50 transform transition-transform duration-500 hover:scale-105">
            <Image 
              src="https://picsum.photos/seed/banklogo/256/256" 
              alt="Bank Logo" 
              width={120} 
              height={120} 
              className="rounded-[1.5rem]"
              priority
              data-ai-hint="bank logo"
            />
          </div>
        </div>
        
        <div className="mt-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-primary font-headline tracking-tighter">طلبات</h1>
            <p className="text-slate-400 text-sm font-medium">نظام التدوير الذكي v2.0</p>
          </div>
          <div className="flex items-center justify-center gap-3 bg-slate-50 px-4 py-2 rounded-full w-fit mx-auto border border-slate-100">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">جاري التحميل</p>
          </div>
        </div>

        <div className="absolute bottom-12 text-center">
          <p className="text-[10px] text-slate-300 font-black tracking-[0.2em] uppercase">Powered by SmartRotation™</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-8 animate-in fade-in duration-700">
      {/* Logo & Welcome */}
      <div className="text-center space-y-4">
        <div className="mx-auto bg-primary/10 p-2 rounded-3xl w-fit shadow-inner overflow-hidden border border-white">
          <Image 
            src="https://picsum.photos/seed/banklogo/200/200" 
            alt="Logo" 
            width={80} 
            height={80} 
            className="rounded-2xl"
            data-ai-hint="bank logo"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-black text-primary tracking-tight font-headline">طلبات</h1>
            <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium">نظام تدوير وتوصيل الطعام الذكي</p>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <Link href="/order" className="group">
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-white overflow-hidden">
            <div className="h-full w-2 bg-green-500 absolute right-0 top-0" />
            <CardContent className="p-6 flex items-center gap-6">
              <div className="bg-green-50 p-4 rounded-2xl">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-slate-800">دخول كموظف</h3>
                <p className="text-xs text-slate-500">لطلب وجبتك اليومية</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/login" className="group">
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-white overflow-hidden">
            <div className="h-full w-2 bg-blue-500 absolute right-0 top-0" />
            <CardContent className="p-6 flex items-center gap-6">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <UserCog className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-slate-800">دخول كمسؤول قسم</h3>
                <p className="text-xs text-slate-500">إدارة طلبات القسم والموظفين</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/login" className="group">
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-white overflow-hidden">
            <div className="h-full w-2 bg-primary absolute right-0 top-0" />
            <CardContent className="p-6 flex items-center gap-6">
              <div className="bg-primary/5 p-4 rounded-2xl">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-slate-800">دخول كمدير للتطبيق</h3>
                <p className="text-xs text-slate-500">التحكم الكامل في النظام والأقسام</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <p className="text-[10px] text-slate-400 font-medium">BankTalabat v2.0 • جميع الحقوق محفوظة</p>
    </div>
  );
}
