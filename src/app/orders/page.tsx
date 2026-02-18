
"use client";

import { useState } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, Clock, User, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { aiOrderInsightTool, AiOrderInsightOutput } from "@/ai/flows/ai-order-insight-tool";

export default function OrdersPage() {
  const { orders, role, clearOrders } = useAppStore();
  const { toast } = useToast();
  const [aiInsights, setAiInsights] = useState<AiOrderInsightOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const pendingOrders = orders.filter(o => o.status === "pending");

  const handleCopySummary = () => {
    if (pendingOrders.length === 0) return;

    // Aggregate items
    const summaryMap: Record<string, number> = {};
    pendingOrders.forEach(order => {
      order.items.forEach(item => {
        summaryMap[item.name] = (summaryMap[item.name] || 0) + item.quantity;
      });
    });

    let text = "*ملخص طلبات الطعام*\n\n";
    Object.entries(summaryMap).forEach(([name, qty]) => {
      text += `- ${name}: (${qty})\n`;
    });
    text += `\n*الإجمالي:* ${pendingOrders.reduce((acc, o) => acc + o.total, 0).toLocaleString()} ريال يمني`;

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "تم النسخ",
        description: "تم نسخ الملخص بتنسيق واتساب",
      });
    });
  };

  const handleAiInsight = async () => {
    setIsAiLoading(true);
    try {
      const insightInput = {
        pendingOrders: pendingOrders.map(o => ({
          employeeName: o.employeeName,
          items: o.items.map(i => ({ name: i.name, quantity: i.quantity }))
        }))
      };
      const result = await aiOrderInsightTool(insightInput);
      setAiInsights(result);
    } catch (error) {
      toast({
        title: "خطأ AI",
        description: "فشل في الحصول على رؤى الذكاء الاصطناعي",
        variant: "destructive"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">الطلبات الجارية</h1>
          {role !== "EMPLOYEE" && pendingOrders.length > 0 && (
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={handleAiInsight} disabled={isAiLoading}>
                <Sparkles className="h-4 w-4 text-accent" />
              </Button>
              <Button size="icon" variant="outline" onClick={handleCopySummary}>
                <Copy className="h-4 w-4 text-primary" />
              </Button>
              {role === "ADMIN" && (
                <Button size="icon" variant="destructive" onClick={clearOrders}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        {aiInsights && (
          <Card className="border-accent/20 bg-accent/5 border shadow-sm animate-in slide-in-from-top-2">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                رؤى الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {aiInsights.suggestedForgottenItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">أصناف منسية محتملة:</p>
                  {aiInsights.suggestedForgottenItems.map((s, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-accent/10 text-xs">
                      <span className="font-bold">{s.employeeName}: </span>
                      قد يحتاج {s.suggestedItems.join(", ")} ({s.reason})
                    </div>
                  ))}
                </div>
              )}
              {aiInsights.frequentlyOrderedCombinations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">مجموعات شائعة:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.frequentlyOrderedCombinations.map((c, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px]">
                        {c.items.join(" + ")} ({c.frequency})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {pendingOrders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>لا توجد طلبات جارية حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-none shadow-md overflow-hidden">
                <div className="h-1 bg-primary w-full" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <User className="h-5 w-5 text-primary" />
                      {order.employeeName}
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {new Date(order.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 border-t pt-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="text-muted-foreground">{(item.price * item.quantity).toLocaleString()} ريال</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t pt-3 font-bold">
                    <span className="text-primary">الإجمالي:</span>
                    <span className="text-lg">{order.total.toLocaleString()} ريال</span>
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
