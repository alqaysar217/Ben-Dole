"use client";

import { useMemo, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking, useAuth } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, UserMinus, UserCheck, RefreshCcw, Info, Sparkles } from "lucide-react";
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

  // جلب الموظفين الذين تم تحديدهم للمشاركة في التدوير فقط
  const empsQuery = useMemoFirebase(() => {
    if (!ready) return null;
    return query(collection(db, "employees"), where("canRotate", "==", true));
  }, [db, ready]);
  
  const { data: rotationEmployees } = useCollection(empsQuery);

  // ترتيب الموظفين حسب الأولوية المحددة مسبقاً
  const sortedEmployees = useMemo(() => {
    if (!rotationEmployees) return [];
    return [...rotationEmployees].sort((a, b) => (a.rotationPriority || 0) - (b.rotationPriority || 0));
  }, [rotationEmployees]);

  // تحديد من هو الشخص الذي عليه الدور (أول شخص لم يكمل مهمته)
  const currentPerson = useMemo(() => {
    return sortedEmployees.find(e => !e.isDone);
  }, [sortedEmployees]);

  // وظيفة إتمام المهمة: تجعل الموظف الحالي "مكتمل" لليوم
  const handleDone = (employee: any) => {
    updateDocumentNonBlocking(doc(db, "employees", employee.id), { isDone: true });
    toast({ title: "تم بنجاح", description: `تم تسجيل نزول ${employee.name} بنجاح` });
  };

  // وظيفة التخطي: تنقل الموظف إلى آخر القائمة
  const handleSkip = (employee: any) => {
    if (!rotationEmployees) return;
    const maxPriority = Math.max(...rotationEmployees.map(e => e.rotationPriority || 0));
    updateDocumentNonBlocking(doc(db, "employees", employee.id), { 
      rotationPriority: maxPriority + 1 
    });
    toast({ title: "تم التخطي", description: "تم نقل الموظف لآخر القائمة ونقل الدور للتالي" });
  };

  // إعادة ضبط الدورة (للمدير فقط)
  const handleReset = () => {
    if (!rotationEmployees || !confirm("هل تريد تصفير حالة جميع الموظفين لبدء دورة جديدة؟")) return;
    rotationEmployees.forEach(emp => {
      updateDocumentNonBlocking(doc(db, "employees", emp.id), { isDone: false });
    });
    toast({ title: "تمت إعادة التعيين", description: "جميع الموظفين جاهزون الآن لدورة جديدة" });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary font-headline">جدول تدوير النزول</h1>
            <p className="text-[10px] text-slate-500">نظام اختيار الموظف المكلف آلياً وبشكل عادل</p>
          </div>
          {isManagement && (
            <Button variant="ghost" size="icon" onClick={handleReset} title="تصفير الدورة">
              <RefreshCcw className="h-5 w-5 text-primary" />
            </Button>
          )}
        </div>

        {/* عرض الشخص المكلف حالياً بشكل بارز */}
        {currentPerson && (
          <Card className="border-none shadow-xl bg-primary text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>
            <CardContent className="p-6 text-center space-y-3 relative z-10">
              <Badge className="bg-yellow-400 text-primary-foreground font-black animate-bounce">المكلف بالنزول حالياً</Badge>
              <h2 className="text-3xl font-black font-headline">{currentPerson.name}</h2>
              <p className="text-sm opacity-80">{currentPerson.phone}</p>
              
              {isManagement && (
                <div className="flex gap-3 justify-center pt-4">
                   <Button 
                    className="bg-white text-primary hover:bg-slate-100 font-bold"
                    onClick={() => handleDone(currentPerson)}
                  >
                    <UserCheck className="ml-2 h-4 w-4" /> تم النزول
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold"
                    onClick={() => handleSkip(currentPerson)}
                  >
                    <UserMinus className="ml-2 h-4 w-4" /> تخطي (غائب)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 px-1">القائمة الكاملة للدورة</h3>
          {!rotationEmployees && ready && (
            <div className="text-center py-10 text-slate-400 italic">جاري تحميل قائمة التدوير...</div>
          )}
          
          {sortedEmployees.map((emp, idx) => {
            const isToday = currentPerson?.id === emp.id;
            const isDone = emp.isDone;
            
            return (
              <Card 
                key={emp.id} 
                className={cn(
                  "border-none transition-all duration-300 bg-white",
                  isToday && "ring-2 ring-primary bg-primary/5 shadow-md",
                  isDone && "opacity-60 bg-slate-50"
                )}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center font-bold text-white font-headline",
                      isToday ? "bg-primary" : (isDone ? "bg-green-500" : "bg-slate-200 text-slate-500")
                    )}>
                      {isDone ? <CheckCircle2 className="h-5 w-5" /> : (idx + 1)}
                    </div>
                    <div>
                      <h3 className={cn("font-bold", isDone && "line-through text-slate-400")}>{emp.name}</h3>
                      <p className="text-[10px] text-slate-500">{emp.phone}</p>
                    </div>
                  </div>
                  
                  {isToday && !isDone && !isManagement && (
                    <Badge variant="secondary" className="animate-pulse">عليه الدور</Badge>
                  )}
                  {isDone && <span className="text-[10px] font-bold text-green-600">اكتمل</span>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-600 flex items-start gap-3 border border-slate-200">
          <Info className="h-5 w-5 mt-0.5 text-primary shrink-0" />
          <p>
            هذا الجدول مرتب حسب الأولوية. بمجرد أن يكمل الموظف مهمته بالنزول، ينتقل الدور آلياً للشخص التالي. يمكن للمسؤول تخطي أي شخص في حال غيابه.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}