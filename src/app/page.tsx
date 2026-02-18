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
          <div className="absolute -inset-12 bg-primary/5 rounded-full animate-ping duration-[2000ms]" />
          <div className="relative bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(15,31,179,0.15)] border border-slate-50 transform transition-transform duration-500 hover:scale-105">
            <Image 
              src="https://picsum.photos/seed/banklogo/256/256" 
              alt="Bank Logo" 
              width={140} 
              height={140} 
              className="rounded-[2.5rem]"
              priority
              data-ai-hint="bank logo"
            />
          </div>
        </div>
        
        <div className="mt-16 text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-primary font-headline tracking-tighter">طلبات</h1>
            <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Premium Banking Experience</p>
          </div>
          <div className="flex items-center justify-center gap-3 bg-slate-50 px-6 py-2.5 rounded-full w-fit mx-auto border border-slate-100 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Authenticating</p>
          </div>
        </div>

        <div className="absolute bottom-12 text-center">
          <p className="text-[10px] text-slate-300 font-bold tracking-[0.3em] uppercase">Powered by SmartRotation™</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-700">
      {/* Logo & Welcome */}
      <div className="text-center space-y-6">
        <div className="mx-auto bg-white p-3 rounded-[2.5rem] w-fit premium-shadow border border-white">
          <Image 
            src="https://picsum.photos/seed/banklogo/200/200" 
            alt="Logo" 
            width={90} 
            height={90} 
            className="rounded-[2rem]"
            data-ai-hint="bank logo"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-5xl font-black text-primary tracking-tight font-headline">طلبات</h1>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium">نظام تدوير وتوصيل الطعام الذكي</p>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 gap-5 w-full max-w-sm">
        <Link href="/order" className="group">
          <Card className="border-none premium-shadow hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 bg-white rounded-[28px] overflow-hidden">
            <CardContent className="p-7 flex items-center gap-6">
              <div className="bg-[#F4F6FA] p-5 rounded-[22px] group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                <User className="h-9 w-9 text-primary group-hover:text-white" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-slate-800">دخول كموظف</h3>
                <p className="text-sm text-slate-500">لطلب وجبتك اليومية</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/login" className="group">
          <Card className="border-none premium-shadow hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 bg-white rounded-[28px] overflow-hidden">
            <CardContent className="p-7 flex items-center gap-6">
              <div className="bg-[#F4F6FA] p-5 rounded-[22px] group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
                <UserCog className="h-9 w-9 text-secondary group-hover:text-white" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-slate-800">دخول كمسؤول قسم</h3>
                <p className="text-sm text-slate-500">إدارة طلبات القسم والموظفين</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/login" className="group">
          <Card className="border-none premium-shadow hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 bg-white rounded-[28px] overflow-hidden">
            <CardContent className="p-7 flex items-center gap-6">
              <div className="bg-[#F4F6FA] p-5 rounded-[22px] group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                <ShieldCheck className="h-9 w-9 text-primary group-hover:text-white" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-slate-800">دخول كمدير للتطبيق</h3>
                <p className="text-sm text-slate-500">التحكم الكامل في النظام</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Safe • Secure • Reliable</p>
        <p className="text-[10px] text-slate-300 font-medium">BankTalabat v2.0 • 2024</p>
      </div>
    </div>
  );
}
