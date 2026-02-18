
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, ShieldCheck, UserCog, Banknote } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-8">
      {/* Logo & Welcome */}
      <div className="text-center space-y-4">
        <div className="mx-auto bg-primary/10 p-6 rounded-3xl w-fit shadow-inner">
          <Banknote className="h-16 w-16 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-primary tracking-tight font-headline">طلبات البنك</h1>
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
