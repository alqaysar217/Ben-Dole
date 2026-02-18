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
import { Plus, Minus, Search, ShoppingCart, User, Building2, Sandwich, Coffee, Pizza } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "sandwich", label: "سندوتشات", icon: Sandwich, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "drink", label: "مشروبات", icon: Coffee, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "add-on", label: "إضافات", icon: Pizza, color: "text-red-500", bg: "bg-red-50" }
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
  const { data: rotationList } = useCollection(rotationQuery);

  const assignedPerson = useMemo(() => {
    if (!rotationList) return "جاري التحميل...";
    const sorted = [...rotationList].sort((a, b) => (a.rotationPriority || 0) - (b.rotationPriority || 0));
    const current = sorted.find(e => !e.isDone);
    return current?.name || "اكتملت دورة اليوم";
  }, [rotationList]);

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
      toast({ title: "تنبيه", description: "يرجى تحديد اسمك أولاً من القائمة", variant: "destructive" });
      return;
    }

    if (Object.keys(cart).length === 0) {
      toast({ title: "تنبيه", description: "سلة المشتريات فارغة", variant: "destructive" });
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
    toast({ title: "تم إرسال الطلب", description: "سيقوم الموظف المكلف بإحضار طلبك قريباً" });
  };

  return (
    <div className="pt-16 pb-28 min-h-screen bg-[#F4F6FA]">
      <TopNav />
      
      <div className="bg-premium-gradient text-white py-4 px-6 flex items-center justify-between sticky top-14 z-40 shadow-xl rounded-b-[28px] overflow-hidden">
        <div className="absolute inset-0 bg-waves opacity-20 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white/20 p-2.5 rounded-[18px] backdrop-blur-md border border-white/10">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase opacity-60 tracking-[0.1em]">المكلف بالنزول اليوم</span>
            <span className="text-lg font-black font-headline tracking-tight">{assignedPerson}</span>
          </div>
        </div>
      </div>

      <main className="p-6 space-y-8 max-w-2xl mx-auto">
        <Card className="border-none premium-shadow bg-white rounded-[28px]">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black flex items-center gap-2 text-slate-400 px-1 uppercase tracking-widest">
                  <Building2 className="h-4 w-4 text-primary" strokeWidth={1.5} /> القسم
                </label>
                <Select value={selectedDepartmentId || ""} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger className="bg-[#F4F6FA] border-none h-14 rounded-2xl input-glow">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none premium-shadow">
                    {departments?.map(dept => <SelectItem key={dept.id} value={dept.id} className="rounded-xl">{dept.deptName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black flex items-center gap-2 text-slate-400 px-1 uppercase tracking-widest">
                  <User className="h-4 w-4 text-primary" strokeWidth={1.5} /> اسم الموظف
                </label>
                <Select value={selectedEmployeeId || ""} onValueChange={setSelectedEmployeeId} disabled={!selectedDepartmentId}>
                  <SelectTrigger className="bg-[#F4F6FA] border-none h-14 rounded-2xl input-glow">
                    <SelectValue placeholder="اختر اسمك" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none premium-shadow">
                    {employees?.map(emp => <SelectItem key={emp.id} value={emp.id} className="rounded-xl">{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-800 font-headline">قائمة الطعام</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">قائمة الأصناف المختارة</p>
            </div>
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="بحث..." 
                className="pr-10 h-12 w-48 rounded-full bg-white border-none premium-shadow text-sm input-glow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-16 bg-white/50 backdrop-blur-sm p-1.5 rounded-[22px] premium-shadow mb-6">
              {CATEGORIES.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id} 
                  className="h-full flex items-center justify-center gap-2 font-bold text-xs rounded-[18px] transition-all duration-500 data-[state=active]:bg-premium-gradient data-[state=active]:text-white data-[state=active]:shadow-xl z-20 relative overflow-hidden"
                >
                  <cat.icon className={cn("h-4 w-4 relative z-30 transition-colors", activeTab === cat.id ? "text-white" : cat.color)} strokeWidth={2} />
                  <span className="relative z-30">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="mt-4 grid grid-cols-1 gap-4 outline-none">
                {filteredMenu.map((item) => (
                  <Card key={item.id} className="border-none premium-shadow bg-white rounded-[24px] group hover:scale-[1.01] transition-all duration-300">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={cn("p-4 rounded-[20px] transition-colors group-hover:bg-primary/5", cat.bg)}>
                          <cat.icon className={cn("h-7 w-7", cat.color)} strokeWidth={1} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-slate-800">{item.itemName}</h3>
                          <p className="text-primary font-black text-sm font-headline tracking-tighter">{item.price} <span className="text-[10px] font-normal text-slate-400">ريال</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-[#F4F6FA] p-2 rounded-2xl border border-white">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-10 w-10 rounded-xl bg-white shadow-sm text-slate-400 hover:text-destructive hover:bg-white" 
                          onClick={() => updateCart(item.id, -1)} 
                          disabled={!cart[item.id]}
                        >
                          <Minus className="h-4 w-4" strokeWidth={3} />
                        </Button>
                        <span className="w-6 text-center font-black text-lg text-primary">{cart[item.id] || 0}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-10 w-10 rounded-xl bg-white shadow-sm text-primary hover:bg-white hover:text-primary-foreground" 
                          onClick={() => updateCart(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" strokeWidth={3} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      {cartTotal > 0 && (
        <div className="fixed bottom-24 left-6 right-6 max-w-2xl mx-auto z-50 animate-in slide-in-from-bottom-10 duration-500">
          <Button 
            className="w-full h-16 bg-glossy-gradient text-white rounded-[24px] shadow-[0_15px_40px_rgba(15,31,179,0.3)] flex items-center justify-between px-8 font-black text-xl transition-all active:scale-95" 
            onClick={handlePlaceOrder}
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
              </div>
              تأكيد الطلب
            </div>
            <div className="font-headline tracking-tighter bg-white/10 px-4 py-1.5 rounded-xl backdrop-blur-sm">
              {cartTotal} <span className="text-xs font-normal opacity-80">ريال</span>
            </div>
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
