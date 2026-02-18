"use client";

import { useMemo, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking, useAuth, initiateAnonymousSignIn } from "@/firebase";
import { collection, query, orderBy, where, doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, UserMinus, UserCheck, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function RotationPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  // Ensure user is signed in anonymously before data hooks fire
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Wait for auth check AND user to be present
  const ready = !isUserLoading && !!user;

  const empsQuery = useMemoFirebase(() => {
    if (!ready) return null;
    // Simplified query for robustness against permission/indexing errors
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
    toast({ title: "تم التصفير", description: "تمت إعادة تعيين الدورة" });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">تدوير التوصيل</h1>
          {user && (
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RefreshCcw className="h-5 w-5 text-primary" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {!rotationEmployees && ready && (
            <div className="text-center py-10 text-slate-400">جاري تحميل قائمة التدوير...</div>
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

                  {isToday && user && !isDone && (
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

                  {isToday && !isDone && !user && (
                    <Badge className="bg-primary animate-pulse py-1 px-3">المكلف اليوم</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-slate-100 p-4 rounded-xl text-sm text-slate-600 flex items-start gap-3 border border-slate-200">
          <ChevronRight className="h-5 w-5 mt-0.5 text-primary" />
          <p>
            يتم التدوير بشكل آلي بين الموظفين المؤهلين. يمكن للمشرف تخطي دور الموظف إذا كان غائباً، وسيتم الانتقال للدور التالي تلقائياً.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}