
"use client";

import { useState } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useFirestore, useCollection, useMemoFirebase, useUser, deleteDocumentNonBlocking } from "@/firebase";
import { useUIStore } from "@/lib/store";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Clock, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { userRole } = useUIStore();
  const { toast } = useToast();
  
  const canManage = userRole === "ADMIN" || userRole === "SUPERVISOR";

  // Real-time Orders
  const ordersQuery = useMemoFirebase(() => 
    query(collection(db, "orders"), orderBy("createdAt", "desc")), [db]);
  const { data: orders } = useCollection(ordersQuery);

  const pendingOrders = orders?.filter(o => o.status === "pending") || [];

  const handleCopySummary = () => {
    if (pendingOrders.length === 0) return;

    const summaryMap: Record<string, number> = {};
    pendingOrders.forEach(order => {
      order.items.forEach((item: any) => {
        summaryMap[item.itemName] = (summaryMap[item.itemName] || 0) + item.quantity;
      });
    });

    let text = "🏦 *ملخص طلبات الطعام*\n\n";
    Object.entries(summaryMap).forEach(([name, qty]) => {
      text += `▫️ ${name}: (${qty})\n`;
    });
    text += `\n💰 *الإجمالي:* ${pendingOrders.reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString()} ريال يمني`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "تم النسخ", description: "تم نسخ الملخص بتنسيق واتساب" });
    });
  };

  const handleClearOrders = () => {
    if (userRole !== "ADMIN") {
      toast({ title: "صلاحية مرفوضة", description: "فقط مدير النظام يمكنه مسح الطلبات", variant: "destructive" });
      return;
    }
    if (!confirm("هل أنت متأكد من مسح جميع الطلبات؟")) return;
    pendingOrders.forEach(order => {
      deleteDocumentNonBlocking(doc(db, "orders", order.id));
    });
    toast({ title: "تم المسح", description: "تم إفراغ قائمة الطلبات" });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">الطلبات الجارية</h1>
          <div className="flex gap-2">
            {canManage && (
              <Button size="icon" variant="outline" onClick={handleCopySummary} disabled={pendingOrders.length === 0} title="نسخ ملخص الطلبات">
                <Copy className="h-4 w-4 text-primary" />
              </Button>
            )}
            {userRole === "ADMIN" && (
              <Button size="icon" variant="destructive" onClick={handleClearOrders} title="مسح كافة الطلبات">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>لا توجد طلبات جارية حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-none shadow-sm bg-white overflow-hidden">
                <div className="h-1 bg-primary/20 w-full" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <User className="h-5 w-5 text-primary/60" />
                      طلب موظف
                    </div>
                  </div>
                  <div className="space-y-1 border-t pt-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span>{item.itemName} × {item.quantity}</span>
                        <span className="font-headline">{(item.price * item.quantity).toLocaleString()} ريال</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 font-bold">
                    <span className="text-primary text-sm">الإجمالي:</span>
                    <span className="text-slate-900 font-headline">{order.totalPrice.toLocaleString()} ريال</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
