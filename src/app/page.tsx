"use client";

import { useState, useMemo } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useUIStore } from "@/lib/store";
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Search, ShoppingCart, User, Building2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const db = useFirestore();
  const { selectedDepartmentId, setSelectedDepartmentId, selectedEmployeeId, setSelectedEmployeeId } = useUIStore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  // Real-time Data
  const deptsQuery = useMemoFirebase(() => collection(db, "departments"), [db]);
  const { data: departments } = useCollection(deptsQuery);

  const empsQuery = useMemoFirebase(() => {
    if (!selectedDepartmentId) return null;
    return query(collection(db, "employees"), where("departmentId", "==", selectedDepartmentId));
  }, [db, selectedDepartmentId]);
  const { data: employees } = useCollection(empsQuery);

  const menuQuery = useMemoFirebase(() => collection(db, "menu_items"), [db]);
  const { data: menu } = useCollection(menuQuery);

  // Rotation logic
  const rotationQuery = useMemoFirebase(() => 
    query(
      collection(db, "employees"), 
      where("canRotate", "==", true),
      where("isDone", "==", false),
      orderBy("rotationPriority", "asc")
    ), [db]);
  const { data: rotationList } = useCollection(rotationQuery);

  const assignedPerson = rotationList?.[0]?.name || "قيد التحديد...";

  const filteredMenu = useMemo(() => {
    if (!menu) return [];
    return menu.filter(item => 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menu, searchTerm]);

  const cartTotal = useMemo(() => {
    if (!menu) return 0;
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
    if (!selectedEmployeeId) {
      toast({ title: "خطأ", description: "يرجى اختيار اسمك أولاً", variant: "destructive" });
      return;
    }

    if (Object.keys(cart).length === 0) {
      toast({ title: "خطأ", description: "السلة فارغة", variant: "destructive" });
      return;
    }

    const orderItems = Object.entries(cart).map(([id, qty]) => {
      const item = menu?.find(m => m.id === id)!;
      return {
        menuItemId: item.id,
        itemName: item.itemName,
        quantity: qty,
        price: item.price
      };
    });

    const newOrder = {
      employeeId: selectedEmployeeId,
      departmentId: selectedDepartmentId,
      items: orderItems,
      totalPrice: cartTotal,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(db, "orders"), newOrder);
    setCart({});
    toast({ title: "تم بنجاح", description: "تم إرسال طلبك بنجاح" });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />
      
      {/* Rotation Banner */}
      <div className="bg-primary text-primary-foreground py-3 px-4 text-center sticky top-14 z-40 shadow-lg">
        <p className="font-bold flex items-center justify-center gap-2">
          <span>المكلف بالنزول اليوم:</span>
          <span className="underline decoration-2 underline-offset-4 font-headline">{assignedPerson}</span>
        </p>
      </div>

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* User Selection */}
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" /> القسم
                </label>
                <Select value={selectedDepartmentId || ""} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.deptName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" /> الموظف
                </label>
                <Select 
                  value={selectedEmployeeId || ""} 
                  onValueChange={setSelectedEmployeeId}
                  disabled={!selectedDepartmentId}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                    <SelectValue placeholder="اختر اسمك" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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

          <div className="grid grid-cols-1 gap-3">
            {filteredMenu.map((item) => (
              <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-800">{item.itemName}</h3>
                    <p className="text-primary font-bold">
                      {item.price.toLocaleString()} ريال يمني
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-full border border-slate-200">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full text-destructive"
                      onClick={() => updateCart(item.id, -1)}
                      disabled={!cart[item.id]}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-4 text-center font-bold text-slate-700">{cart[item.id] || 0}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full text-primary"
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
        <div className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
          <Button 
            className="w-full h-14 bg-primary text-white rounded-xl shadow-2xl flex items-center justify-between px-6"
            onClick={handlePlaceOrder}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">تأكيد الطلب</span>
            </div>
            <span className="text-xl font-headline font-bold">
              {cartTotal.toLocaleString()} ريال
            </span>
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}