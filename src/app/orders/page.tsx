"use client";

import { useState, useMemo, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { useUIStore } from "@/lib/store";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Clock, User, ReceiptText, CalendarDays, History, CheckCircle, ShieldCheck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { userRole } = useUIStore();
  const { toast } = useToast();
  
  const isAdmin = userRole === "ADMIN";
  const isSupervisor = userRole === "SUPERVISOR";
  const canManage = isAdmin || isSupervisor;

  const empsQuery = useMemoFirebase(() => collection(db, "employees"), [db]);
  const { data: employees } = useCollection(empsQuery);

  const ordersQuery = useMemoFirebase(() => 
    query(collection(db, "orders"), orderBy("createdAt", "desc")), [db]);
  const { data: allOrders } = useCollection(ordersQuery);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [isMounted]);

  const todayOrders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter(o => {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
      return o.status === "pending" && orderDate >= startOfToday;
    });
  }, [allOrders, startOfToday]);

  const historyOrders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter(o => {
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
      return o.status === "completed" || orderDate < startOfToday;
    });
  }, [allOrders, startOfToday]);

  const handleCopySummary = () => {
    if (todayOrders.length === 0) return;

    const summaryMap: Record<string, { quantity: number; price: number }> = {};
    let grandTotal = 0;

    todayOrders.forEach(order => {
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
    const todayStr = new Date().toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    text += `📅 *التاريخ:* ${todayStr}\n`;
    text += "━━━━━━━━━━━━━━━\n\n";
    
    Object.entries(summaryMap).forEach(([name, data]) => {
      text += `▫️ *${name}* (${data.quantity}) ← ${data.price.toLocaleString()} ريال\n`;
    });
    
    text += "\n━━━━━━━━━━━━━━━\n";
    text += `💰 *الإجمالي الكلي:* ${grandTotal.toLocaleString()} ريال يمني`;

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "تم النسخ", description: "تم نسخ ملخص طلبات اليوم بنجاح" });
    });
  };

  const handleCompleteAll = () => {
    if (!confirm("هل تريد أرشفة كافة طلبات اليوم ونقلها للسجل؟")) return;
    todayOrders.forEach(order => {
      updateDocumentNonBlocking(doc(db, "orders", order.id), { status: "completed" });
    });
    toast({ title: "تمت الأرشفة", description: "تم نقل الطلبات إلى سجل التاريخ" });
  };

  const handleDeleteOrder = (id: string) => {
    if (!canManage) return;
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      deleteDocumentNonBlocking(doc(db, "orders", id));
      toast({ title: "تم الحذف", description: "تم إزالة الطلب بنجاح" });
    }
  };

  const handleClearAll = () => {
    if (!canManage) return;
    if (confirm("تحذير: هل تريد مسح كافة طلبات اليوم نهائياً؟")) {
      todayOrders.forEach(order => {
        deleteDocumentNonBlocking(doc(db, "orders", order.id));
      });
      toast({ title: "تم المسح", description: "تم إفراغ قائمة طلبات اليوم" });
    }
  };

  const getEmployeeName = (empId: string) => {
    return employees?.find(e => e.id === empId)?.name || "موظف غير معروف";
  };

  const renderOrderCard = (order: any) => (
    <Card key={order.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow relative">
      <div className={cn("h-1 w-full", order.status === 'completed' ? "bg-green-500" : "bg-primary/20")} />
      <CardContent className="p-4 space-y-3 text-right">
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-2 font-bold text-slate-800 flex-row-reverse">
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm">{getEmployeeName(order.employeeId)}</span>
              <span className="text-[9px] text-slate-400 font-normal">
                {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString('ar-YE', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && order.status === 'pending' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                onClick={() => handleDeleteOrder(order.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {order.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
        </div>
        
        <div className="space-y-1.5 border-t pt-3 border-dashed border-slate-100">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center text-xs flex-row-reverse">
              <div className="flex gap-1.5 items-center flex-row-reverse">
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold text-[10px]">{item.quantity}</span>
                <span className="text-slate-700 font-medium">{item.itemName}</span>
              </div>
              <span className="font-headline text-slate-400">{(item.price * item.quantity).toLocaleString()} ريال</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1 flex-row-reverse">
          <span className="text-slate-500 text-[10px] font-bold">الإجمالي:</span>
          <span className="text-primary font-black font-headline text-lg">{order.totalPrice.toLocaleString()} <span className="text-[10px] font-normal">ريال</span></span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-row-reverse">
            <div className="text-right">
              <h1 className="text-xl font-bold text-primary flex items-center gap-2 flex-row-reverse">
                <ReceiptText className="h-5 w-5" />
                إدارة الطلبات
              </h1>
              {canManage && (
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <span className="text-[9px] text-green-600 font-bold uppercase">نمط {isAdmin ? "المدير" : "المشرف"} مفعل</span>
                  <ShieldCheck className="h-3 w-3 text-green-600" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {canManage && todayOrders.length > 0 && (
                <>
                  <Button size="icon" variant="outline" className="h-9 w-9 text-green-600 border-green-200 bg-green-50/50 hover:bg-green-50 shadow-sm" onClick={handleCompleteAll} title="أرشفة كافة طلبات اليوم">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10" onClick={handleClearAll} title="مسح كافة طلبات اليوم">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11 bg-slate-50 p-1">
              <TabsTrigger value="today" className="gap-2 font-bold text-xs">
                <CalendarDays className="h-3.5 w-3.5" /> اليوم ({todayOrders.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 font-bold text-xs">
                <History className="h-3.5 w-3.5" /> السجل ({historyOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4 pt-4">
              {canManage && todayOrders.length > 0 && (
                <Button 
                  onClick={handleCopySummary} 
                  className="w-full gap-2 font-bold bg-primary shadow-lg shadow-primary/20 h-12 rounded-xl transition-transform active:scale-95"
                >
                  <Copy className="h-4 w-4" />
                  نسخ ملخص طلبات اليوم للواتساب
                </Button>
              )}

              {todayOrders.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Clock className="h-12 w-12 opacity-10 mx-auto mb-2" />
                  <p className="text-sm">لا توجد طلبات نشطة حالياً</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayOrders.map(order => renderOrderCard(order))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 pt-4">
              {historyOrders.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <History className="h-12 w-12 opacity-10 mx-auto mb-2" />
                  <p className="text-sm">السجل فارغ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyOrders.map(order => renderOrderCard(order))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
