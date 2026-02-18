"use client";

import { useState } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useFirestore, useCollection, useMemoFirebase, useUser, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, Clock, User, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { aiOrderInsightTool, AiOrderInsightOutput } from "@/ai/flows/ai-order-insight-tool";

export default function OrdersPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [aiInsights, setAiInsights] = useState<AiOrderInsightOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Real-time Orders
  const ordersQuery = useMemoFirebase(() => 
    query(collection(db, "orders"), orderBy("createdAt", "desc")), [db]);
  const { data: orders } = useCollection(ordersQuery);

  const pendingOrders = orders?.filter(o => o.status === "pending") || [];

  const handleCopySummary = () => {
    if (pendingOrders.length === 0) return;

    // Aggregate items
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
    if (!confirm("هل أنت متأكد من مسح جميع الطلبات؟")) return;
    pendingOrders.forEach(order => {
      deleteDocumentNonBlocking(doc(db, "orders", order.id));
    });
    toast({ title: "تم المسح", description: "تم إفراغ قائمة الطلبات" });
  };

  const handleAiInsight = async () => {
    setIsAiLoading(true);
    try {
      const insightInput = {
        pendingOrders: pendingOrders.map(o => ({
          employeeName: "موظف", // Simplified for security in this demo
          items: o.items.map((i: any) => ({ name: i.itemName, quantity: i.quantity }))
        }))
      };
      const result = await aiOrderInsightTool(insightInput);
      setAiInsights(result);
    } catch (error) {
      toast({ title: "خطأ AI", description: "فشل في الحصول على رؤى الذكاء الاصطناعي", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">الطلبات الجارية</h1>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={handleAiInsight} disabled={isAiLoading || pendingOrders.length === 0}>
              <Sparkles className="h-4 w-4 text-primary" />
            </Button>
            <Button size="icon" variant="outline" onClick={handleCopySummary} disabled={pendingOrders.length === 0}>
              <Copy className="h-4 w-4 text-primary" />
            </Button>
            {user && (
              <Button size="icon" variant="destructive" onClick={handleClearOrders}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* AI Insights Section */}
        {aiInsights && (
          <Card className="border-primary/10 bg-primary/5 border shadow-sm">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                رؤى الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {aiInsights.suggestedForgottenItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500">أصناف منسية محتملة:</p>
                  {aiInsights.suggestedForgottenItems.map((s, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-slate-100 text-xs">
                      <span className="font-bold text-primary">اقتراح: </span>
                      قد يحتاج {s.suggestedItems.join(", ")} ({s.reason})
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                    <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
                      <User className="h-5 w-5 text-primary/60" />
                      طلب مجهول
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-headline">
                      {order.createdAt?.toDate?.() ? 
                        order.createdAt.toDate().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) 
                        : '...'
                      }
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 border-t pt-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.itemName} × {item.quantity}</span>
                        <span className="text-slate-500 font-headline">{(item.price * item.quantity).toLocaleString()} ريال</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 font-bold">
                    <span className="text-primary">الإجمالي:</span>
                    <span className="text-lg text-slate-900 font-headline">{order.totalPrice.toLocaleString()} ريال</span>
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