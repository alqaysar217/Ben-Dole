
"use client";

import { useState, useMemo, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useUIStore } from "@/lib/store";
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, useAuth, useUser, initiateAnonymousSignIn } from "@/firebase";
import { collection, query, where, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Search, ShoppingCart, User, Building2, Utensils, Sandwich, Coffee, Pizza } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { id: "sandwich", label: "سندوتشات", icon: Sandwich },
  { id: "drink", label: "مشروبات", icon: Coffee },
  { id: "add-on", label: "إضافات", icon: Pizza }
];

export default function OrderPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { selectedDepartmentId, setSelectedDepartmentId, selectedEmployeeId, setSelectedEmployeeId } = useUIStore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("sandwich");

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const ready = !isUserLoading && user !== null;

  const deptsQuery = useMemoFirebase(() => 
    ready ? collection(db, "departments") : null, [db, ready]);
  const { data: departments } = useCollection(deptsQuery);

  const empsQuery = useMemoFirebase(() => {
    if (!ready || !selectedDepartmentId) return null;
    return query(collection(db, "employees"), where("departmentId", "==", selectedDepartmentId));
  }, [db, selectedDepartmentId, ready]);
  const { data: employees } = useCollection(empsQuery);

  const menuQuery = useMemoFirebase(() => 
    ready ? collection(db, "menu_items") : null, [db, ready]);
  const { data: menu } = useCollection(menuQuery);

  const rotationQuery = useMemoFirebase(() => 
    ready ? query(collection(db, "employees"), where("canRotate", "==", true)) : null, [db, ready]);
  const { data: allRotationEmployees } = useCollection(rotationQuery);

  const assignedPerson = useMemo(() => {
    if (!allRotationEmployees) return "جاري التحميل...";
    const pending = allRotationEmployees
      .filter(e => !e.isDone)
      .sort((a, b) => (a.rotationPriority || 0) - (b.rotationPriority || 0));
    return pending[0]?.name || "الكل مكتمل اليوم";
  }, [allRotationEmployees]);

  const filteredMenu = useMemo(() => {
    if (!menu) return [];
    return menu.filter(item => 
      item.category === activeTab &&
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menu, activeTab, searchTerm]);

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
    <div className="pt-14 pb-24">
      <TopNav />
      
      <div className="bg-primary text-primary-foreground py-4 px-4 text-center sticky top-14 z-40 shadow-xl border-b border-white/10">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">المكلف بالنزول وتوصيل الطلبات اليوم</p>
          <p className="text-xl font-black flex items-center justify-center gap-2">
            <Utensils className="h-5 w-5" />
            <span className="underline decoration-wavy decoration-2 underline-offset-4 font-headline">{assignedPerson}</span>
          </p>
        </div>
      </div>

      <main className="p-4 space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center gap-2 text-slate-500 px-1">
                  <Building2 className="h-3.5 w-3.5" /> القسم البنكي
                </label>
                <Select value={selectedDepartmentId || ""} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-11">
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
                <label className="text-xs font-bold flex items-center gap-2 text-slate-500 px-1">
                  <User className="h-3.5 w-3.5" /> اسم الموظف
                </label>
                <Select 
                  value={selectedEmployeeId || ""} 
                  onValueChange={setSelectedEmployeeId}
                  disabled={!selectedDepartmentId}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-11">
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

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-800">قائمة الطعام</h2>
            <div className="relative w-40 sm:w-48">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="بحث..." 
                className="pr-9 h-9 rounded-full bg-white border-slate-200 shadow-sm text-right text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-slate-100 p-1 rounded-xl">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id} 
                    className="flex items-center gap-2 font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-primary rounded-lg transition-all"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.slice(0, 6)}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {CATEGORIES.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="mt-4 space-y-3">
                {filteredMenu.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    لا توجد أصناف في هذا القسم حالياً
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredMenu.map((item) => (
                      <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all active:scale-[0.98] bg-white group">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{item.itemName}</h3>
                            <p className="text-primary font-bold text-sm">
                              {item.price.toLocaleString()} ريال
                            </p>
                          </div>
                          <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-full border border-slate-100">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                              onClick={() => updateCart(item.id, -1)}
                              disabled={!cart[item.id]}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-4 text-center font-bold text-slate-700 text-sm">{cart[item.id] || 0}</span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                              onClick={() => updateCart(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      {cartTotal > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto z-50 animate-in slide-in-from-bottom-10">
          <Button 
            className="w-full h-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-between px-6 hover:bg-primary/90 active:scale-95 transition-transform"
            onClick={handlePlaceOrder}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">إتمام الطلب</span>
            </div>
            <div className="text-left">
              <span className="text-xl font-headline font-bold">
                {cartTotal.toLocaleString()}
              </span>
              <span className="text-[10px] mr-1 opacity-80 uppercase">Rial</span>
            </div>
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
