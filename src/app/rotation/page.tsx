
"use client";

import { useMemo } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, UserMinus, UserCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function RotationPage() {
  const { employees, role, currentRotationIndex, skipDelivery, markDeliveryDone, resetRotation } = useAppStore();
  const { toast } = useToast();

  const eligibleEmployees = useMemo(() => {
    return employees.filter(e => e.isEligible);
  }, [employees]);

  const currentIndex = currentRotationIndex % eligibleEmployees.length;

  const handleDone = (id: string) => {
    markDeliveryDone(id);
    toast({
      title: "تم التسجيل",
      description: "تم تحديد الموظف كمكتمل للدورة اليوم",
    });
  };

  const handleSkip = () => {
    skipDelivery();
    toast({
      title: "تم التخطي",
      description: "تم نقل المهمة للموظف التالي",
    });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">تدوير التوصيل</h1>
          {role === "ADMIN" && (
            <Button variant="ghost" size="icon" onClick={resetRotation}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {eligibleEmployees.map((emp, idx) => {
            const isToday = idx === currentIndex;
            const isDone = emp.deliveryDone;
            
            return (
              <Card 
                key={emp.id} 
                className={cn(
                  "border-none transition-all duration-300",
                  isToday && "ring-2 ring-primary scale-[1.02] shadow-lg bg-primary/5",
                  !isToday && "opacity-80"
                )}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center font-bold text-white",
                      isToday ? "bg-primary" : (isDone ? "bg-green-500" : "bg-muted-foreground/30")
                    )}>
                      {isDone ? <CheckCircle2 className="h-6 w-6" /> : (idx + 1)}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className={cn(
                        "font-bold text-lg",
                        isDone && "line-through text-muted-foreground"
                      )}>
                        {emp.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </div>
                  </div>

                  {isToday && (role === "SUPERVISOR" || role === "ADMIN") && !isDone && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-8 px-2"
                        onClick={handleSkip}
                      >
                        <UserMinus className="h-3.5 w-3.5 ml-1" />
                        تخطي
                      </Button>
                      <Button 
                        size="sm" 
                        className="text-xs h-8 px-2 bg-green-600 hover:bg-green-700"
                        onClick={() => handleDone(emp.id)}
                      >
                        <UserCheck className="h-3.5 w-3.5 ml-1" />
                        تم
                      </Button>
                    </div>
                  )}

                  {isToday && !isDone && (role === "EMPLOYEE") && (
                    <Badge variant="default" className="bg-primary animate-pulse">
                      المكلف اليوم
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-muted/30 p-4 rounded-xl text-sm text-muted-foreground flex items-start gap-3">
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
