
"use client";

import { useState, useMemo } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useFirestore, useCollection, useMemoFirebase, useUser, deleteDocumentNonBlocking } from "@/firebase";
import { useUIStore } from "@/lib/store";
import { collection, query, orderBy, doc, where } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Clock, User, Trash2, ReceiptText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { userRole } = useUIStore();
  const { toast } = useToast();
  
  const canManage = userRole === "ADMIN" || userRole === "SUPERVISOR";

  // Fetch all employees to map IDs to Names
  const empsQuery = useMemoFirebase(() => collection(db, "employees"), [db]);
  const { data: employees } = useCollection(empsQuery);

  // Real-time Orders
  const ordersQuery = useMemoFirebase(() => 
    query(collection(db, "orders"), orderBy("createdAt", "desc")), [db]);
  const { data: orders } = useCollection(ordersQuery);

  const pendingOrders = useMemo(() => {
    return orders?.filter(o => o.status === "pending") || [];
  }, [orders]);

  const handleCopySummary = () => {
    if (pendingOrders.length === 0) return;

    // Map to group items and their totals
    const summaryMap: Record<string, { quantity: number; price: number }> = {};
    let grandTotal = 0;

    pendingOrders.forEach(order => {
      order.items.forEach((item: any) => {
        const name = item.itemName;
        if (!summaryMap[name]) {
          summaryMap[name] = { quantity: 0, price: 0 };
        }
        summaryMap[name].quantity += item.quantity;
        summaryMap[name].price += (item.price * item.quantity);
        grandTotal += (item.price * item.quantity);
      });
    });

    let text = "🏦 *ملخص طلبات البنك لهذا اليوم*\n";
    text += "━━━━━━━━━━━━━━━\n\n";
    
    Object.entries(summaryMap).forEach(([name, data]) => {
      text += `▫️ *${name}* (${data.quantity}) ← ${data.price.toLocaleString()} ريال\n`;
    });
    
    text += "\n━━━━━━━━━━━━━━━\n";
    text += `💰 *الإجمالي الكلي:* ${grandTotal.toLocaleString()} ريال يمني`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ 
        title: "تم النسخ", 
        description: "تم نسخ ملخص الطلبات بتنسيق مفصل للواتساب" 
      });
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
    toast({ title: "تم المسح", description: "تم إفراغ قائمة الطلبات بنجاح" });
  };

  const getEmployeeName = (empId: string) => {
    return employees?.find(e => e.id === empId)?.name || "موظف غير معروف";
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <ReceiptText className="h-5 w-5" />
              الطلبات الجارية
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">إجمالي الطلبات النشطة: {pendingOrders.length}</p>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCopySummary} 
                disabled={pendingOrders.length === 0}
                className="gap-2 border-primary text-primary hover:bg-primary/5 font-bold"
              >
                <Copy className="h-4 w-4" />
                نسخ الملخص
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
            <p className="font-medium">لا توجد طلبات جارية حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                <div className="h-1 bg-primary/10 w-full" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <div className="bg-primary/5 p-1.5 rounded-lg">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm">{getEmployeeName(order.employeeId)}</span>
                        <span className="text-[9px] text-slate-400 font-normal">
                          {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 border-t pt-3 border-dashed border-slate-100">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex gap-1.5 items-center">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold text-[10px]">{item.quantity}</span>
                          <span className="text-slate-700 font-medium">{item.itemName}</span>
                        </div>
                        <span className="font-headline text-slate-400">{(item.price * item.quantity).toLocaleString()} ريال</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                    <span className="text-slate-500 text-[10px] font-bold">المجموع:</span>
                    <span className="text-primary font-black font-headline text-lg">{order.totalPrice.toLocaleString()} <span className="text-[10px] font-normal">ريال</span></span>
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
