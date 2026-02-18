
"use client";

import { useMemo, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking, useAuth, initiateAnonymousSignIn } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, UserMinus, UserCheck, RefreshCcw, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/store";

export default function RotationPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { userRole } = useUIStore();
  const { toast } = useToast();

  const isManagement = userRole === "ADMIN" || userRole === "SUPERVISOR";

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const ready = !isUserLoading && user !== null;

  // Only get employees who ARE allowed to rotate
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
    toast({ title: "تم التسجيل", description: "تم تحديد الموظف كمكتمل للدورة اليوم" });
  };

  const handleSkip = (employee: any) => {
    if (!rotationEmployees) return;
    const maxPriority = Math.max(...rotationEmployees.map(e => e.rotationPriority || 0));
    updateDocumentNonBlocking(doc(db, "employees", employee.id), { rotationPriority: maxPriority + 1 });
    toast({ title: "تم التخطي", description: "تم نقل المهمة للموظف التالي" });
  };

  const handleReset = () => {
    if (!rotationEmployees) return;
    rotationEmployees.forEach(emp => {
      updateDocumentNonBlocking(doc(db, "employees", emp.id), { isDone: false });
    });
    toast({ title: "تم التصفير", description: "تمت إعادة تعيين الدورة اليومية" });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">تدوير التوصيل</h1>
            <p className="text-[10px] text-slate-500">قائمة الموظفين المكلفين بالنزول</p>
          </div>
          {isManagement && (
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RefreshCcw className="h-5 w-5 text-primary" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {!rotationEmployees && ready && (
            <div className="text-center py-10 text-slate-400 italic">جاري تحميل قائمة التدوير...</div>
          )}
          
          {sortedEmployees.length === 0 && ready && (
            <div className="bg-white p-8 rounded-xl text-center border-2 border-dashed border-slate-200">
              <Info className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-slate-500 text-sm">لا يوجد موظفين مسجلين في الدورة حالياً</p>
            </div>
          )}

          {sortedEmployees.map((emp, idx) => {
            const isToday = currentPerson?.id === emp.id;
            const isDone = emp.isDone;
            
            return (
              <Card 
                key={emp.id} 
                className={cn(
                  "border-none transition-all duration-300 bg-white",
                  isToday && "ring-2 ring-primary scale-[1.02] shadow-xl",
                  isDone && "opacity-60 bg-slate-50"
                )}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center font-bold text-white font-headline",
                      isToday ? "bg-primary" : (isDone ? "bg-green-500" : "bg-slate-200 text-slate-500")
                    )}>
                      {isDone ? <CheckCircle2 className="h-6 w-6" /> : (idx + 1)}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className={cn(
                        "font-bold text-lg text-slate-800",
                        isDone && "line-through text-slate-400"
                      )}>
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-500">{emp.phone}</p>
                    </div>
                  </div>

                  {isToday && isManagement && !isDone && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-9 px-3 font-bold border-slate-200"
                        onClick={() => handleSkip(emp)}
                      >
                        <UserMinus className="h-3.5 w-3.5 ml-1" />
                        تخطي
                      </Button>
                      <Button 
                        size="sm" 
                        className="text-xs h-9 px-3 font-bold bg-green-600 hover:bg-green-700"
                        onClick={() => handleDone(emp)}
                      >
                        <UserCheck className="h-3.5 w-3.5 ml-1" />
                        تم
                      </Button>
                    </div>
                  )}

                  {isToday && !isDone && !isManagement && (
                    <Badge className="bg-primary animate-pulse py-1 px-3">المكلف اليوم</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-600 flex items-start gap-3 border border-slate-200 leading-relaxed">
          <ChevronRight className="h-5 w-5 mt-0.5 text-primary shrink-0" />
          <p>
            يتم استبعاد الموظفين الإداريين أو كبار السن من هذه القائمة تلقائياً بناءً على إعدادات المدير. التدوير يتم بين الموظفين الشباب والميدانيين فقط لضمان كفاءة العمل.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
