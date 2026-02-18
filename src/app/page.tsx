
"use client";

import { useState, useMemo, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAppStore, MenuItem, Order, OrderItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Search, ShoppingCart, User } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { menu, employees, orders, addOrder, currentRotationIndex, currentUser, setCurrentUser } = useAppStore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  const assignedPerson = useMemo(() => {
    const eligible = employees.filter(e => e.isEligible);
    return eligible[currentRotationIndex % eligible.length]?.name || "غير محدد";
  }, [employees, currentRotationIndex]);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menu, searchTerm]);

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((acc, [id, qty]) => {
      const item = menu.find(m => m.id === id);
      return acc + (item?.price || 0) * qty;
    }, 0);
  }, [cart, menu]);

  const updateCart = (id: string, delta: number) => {
    setCart(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const handlePlaceOrder = () => {
    if (!currentUser) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار اسم الموظف أولاً",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(cart).length === 0) {
      toast({
        title: "خطأ",
        description: "السلة فارغة",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates in current session orders
    const existingOrder = orders.find(o => o.employeeName === currentUser && o.status === 'pending');
    if (existingOrder) {
      toast({
        title: "تنبيه",
        description: "لديك طلب معلق بالفعل. سيتم إضافته إلى القائمة.",
      });
    }

    const orderItems: OrderItem[] = Object.entries(cart).map(([id, qty]) => {
      const item = menu.find(m => m.id === id)!;
      return {
        id: Math.random().toString(36).substr(2, 9),
        menuItemId: item.id,
        name: item.name,
        quantity: qty,
        price: item.price
      };
    });

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      employeeName: currentUser,
      items: orderItems,
      total: cartTotal,
      timestamp: Date.now(),
      status: "pending"
    };

    addOrder(newOrder);
    setCart({});
    toast({
      title: "تم بنجاح",
      description: "تم إرسال طلبك بنجاح",
    });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />
      
      {/* Rotation Banner */}
      <div className="bg-accent text-white py-3 px-4 text-center sticky top-14 z-40 shadow-sm animate-in fade-in slide-in-from-top-2">
        <p className="font-bold flex items-center justify-center gap-2">
          <span>المكلف بالنزول اليوم:</span>
          <span className="underline decoration-2 underline-offset-4">{assignedPerson}</span>
        </p>
      </div>

      <main className="p-4 space-y-6">
        {/* User Selection */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardContent className="p-4 bg-white space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <User className="h-5 w-5" />
              <h2>اختيار الموظف</h2>
            </div>
            <Select value={currentUser || ""} onValueChange={setCurrentUser}>
              <SelectTrigger className="w-full bg-background border-none shadow-inner h-12">
                <SelectValue placeholder="اختر اسمك من القائمة" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.name}>
                    {emp.name} ({emp.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Menu Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">قائمة الطعام</h2>
            <div className="relative w-1/2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="بحث..." 
                className="pr-9 h-10 rounded-full bg-white border-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMenu.map((item) => (
              <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-primary font-semibold text-sm">
                      {item.price.toLocaleString()} ريال يمني
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-background p-1 rounded-full">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                      onClick={() => updateCart(item.id, -1)}
                      disabled={!cart[item.id]}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-4 text-center font-bold">{cart[item.id] || 0}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full text-primary hover:text-primary"
                      onClick={() => updateCart(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Cart Button */}
      {cartTotal > 0 && (
        <div className="fixed bottom-20 left-4 right-4 animate-in slide-in-from-bottom-4">
          <Button 
            className="w-full h-14 bg-primary text-white rounded-xl shadow-xl flex items-center justify-between px-6"
            onClick={handlePlaceOrder}
          >
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="font-bold">تأكيد الطلب</span>
            </div>
            <span className="text-lg font-bold">
              {cartTotal.toLocaleString()} ريال
            </span>
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
