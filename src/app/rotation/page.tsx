"use client";

import { useMemo } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, UserMinus, UserCheck, RefreshCcw, Info, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/store";

export default function RotationPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { userRole } = useUIStore();
  const { toast } = useToast();

  const isManagement = userRole === "ADMIN" || userRole === "SUPERVISOR";

  const ready = !isUserLoading;

  const empsQuery = useMemoFirebase(() => {
    if (!ready) return null;
    return query(collection(db, "employees"), where("canRotate", "==", true));
  }, [db, ready]);
  
  const { data: rotationEmployees } = useCollection(empsQuery);

  const sortedEmployees = useMemo(() => {
    if (!rotationEmployees) return [];
    return [...rotationEmployees].sort((a, b) => (a.rotationPriority || 0) - (b.rotationPriority || 0));
  }, [rotationEmployees]);

  const currentPerson = useMemo(() => {
    return sortedEmployees.find(e => !e.isDone);
  }, [sortedEmployees]);

  const handleDone = (employee: any) => {
    updateDocumentNonBlocking(doc(db, "employees", employee.id), { isDone: true });
    toast({ title: "تم بنجاح", description: `تم تسجيل إتمام مهمة ${employee.name}` });
  };

  const handleSkip = (employee: any) => {
    if (!rotationEmployees) return;
    const maxPriority = Math.max(...rotationEmployees.map(e => e.rotationPriority || 0));
    updateDocumentNonBlocking(doc(db, "employees", employee.id), { 
      rotationPriority: maxPriority + 1 
    });
    toast({ title: "تم التخطي", description: "تم نقل الموظف لآخر القائمة ونقل الدور للتالي" });
  };

  const handleReset = () => {
    if (!rotationEmployees || !confirm("هل تريد تصفير حالة جميع الموظفين لبدء دورة جديدة؟")) return;
    rotationEmployees.forEach(emp => {
      updateDocumentNonBlocking(doc(db, "employees", emp.id), { isDone: false });
    });
    toast({ title: "تمت إعادة التعيين", description: "جميع الموظفين جاهزون الآن لدورة جديدة" });
  };

  return (
    <div className="pt-16 pb-24 min-h-screen bg-[#F4F6FA]">
      <TopNav />

      <main className="p-6 space-y-8 max-w-2xl mx-auto">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary font-headline">نظام التدوير</h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">إدارة نظام النزول والمهام اليومية</p>
          </div>
          {isManagement && (
            <Button variant="ghost" size="icon" className="rounded-full bg-white premium-shadow h-12 w-12" onClick={handleReset}>
              <RefreshCcw className="h-5 w-5 text-primary" />
            </Button>
          )}
        </div>

        {/* بطاقة الشخص الحالي بنمط بنكي */}
        {currentPerson ? (
          <Card className="border-none premium-shadow bg-premium-gradient text-white rounded-[32px] overflow-hidden relative">
            <div className="absolute inset-0 bg-waves opacity-20" />
            <div className="absolute top-6 left-6 opacity-40">
              <User className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <CardContent className="p-8 space-y-12 relative z-10 text-right">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">الموظف المكلف حالياً</p>
                  <h2 className="text-3xl font-black font-headline tracking-tight">{currentPerson.name}</h2>
                </div>
              </div>
              
              {isManagement && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                   <Button 
                    className="bg-white text-primary hover:bg-white/90 font-bold rounded-2xl h-12 transition-all active:scale-95"
                    onClick={() => handleDone(currentPerson)}
                  >
                    <UserCheck className="ml-2 h-4 w-4" /> إتمام المهمة
                  </Button>
                  <Button 
                    className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl h-12 border border-white/20 backdrop-blur-sm transition-all active:scale-95"
                    onClick={() => handleSkip(currentPerson)}
                  >
                    <UserMinus className="ml-2 h-4 w-4" /> تخطي الموظف
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none premium-shadow bg-white rounded-[32px] p-8 text-center space-y-4">
             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
               <Sparkles className="h-8 w-8 text-primary opacity-20" />
             </div>
             <p className="text-slate-500 font-bold">اكتملت جميع المهام لهذا اليوم</p>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 px-2 uppercase tracking-widest">ترتيب الدور</h3>
          {!rotationEmployees && ready && (
            <div className="text-center py-10 text-slate-400 italic">جاري تحميل القائمة...</div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            {sortedEmployees.map((emp, idx) => {
              const isToday = currentPerson?.id === emp.id;
              const isDone = emp.isDone;
              
              return (
                <Card 
                  key={emp.id} 
                  className={cn(
                    "border-none transition-all duration-500 rounded-[24px] premium-shadow",
                    isToday ? "bg-white scale-[1.02] ring-2 ring-primary/20" : "bg-white/80 backdrop-blur-sm",
                    isDone && "opacity-60 bg-slate-100"
                  )}
                >
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "h-12 w-12 rounded-[18px] flex items-center justify-center font-black text-lg font-headline transition-colors duration-500",
                        isToday ? "bg-premium-gradient text-white" : (isDone ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")
                      )}>
                        {isDone ? <CheckCircle2 className="h-6 w-6" /> : (idx + 1)}
                      </div>
                      <div className="space-y-0.5 text-right">
                        <h3 className={cn("font-bold text-slate-800", isDone && "line-through text-slate-400")}>{emp.name}</h3>
                        <p className="text-[11px] text-slate-400 font-medium tracking-tight">{emp.phone}</p>
                      </div>
                    </div>
                    
                    {isToday && !isDone && (
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] px-2 py-0.5 font-black uppercase">عليه الدور</Badge>
                      </div>
                    )}
                    {isDone && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[28px] text-[11px] text-slate-500 flex items-start gap-4 border border-white premium-shadow text-right">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Info className="h-4 w-4" />
          </div>
          <p className="leading-relaxed">
            يتم تحديث قائمة التدوير آلياً لضمان العدالة بين جميع الموظفين. يتم اختيار الشخص التالي بناءً على الأقدمية في القائمة.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
