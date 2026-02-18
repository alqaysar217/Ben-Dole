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
import { Plus, Minus, Search, ShoppingCart, User, Building2, Utensils, Sandwich, Coffee, Pizza, Sparkles, MapPin } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { id: "sandwich", label: "سندوتشات", icon: Sandwich, color: "text-orange-500" },
  { id: "drink", label: "مشروبات", icon: Coffee, color: "text-blue-500" },
  { id: "add-on", label: "إضافات", icon: Pizza, color: "text-red-500" }
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

  // جلب الشخص المكلف بالنزول من قاعدة البيانات (نفس منطق صفحة التدوير)
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
    <div className="pt-14 pb-24">
      <TopNav />
      
      {/* عرض الشخص المكلف بالنزول في أعلى الصفحة */}
      <div className="bg-primary text-white py-3 px-4 flex items-center justify-between sticky top-14 z-40 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 p-1.5 rounded-lg">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-black opacity-80 tracking-tighter">المكلف بالنزول اليوم</span>
            <span className="text-sm font-bold font-headline">{assignedPerson}</span>
          </div>
        </div>
        <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
      </div>

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center gap-2 text-slate-500 px-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> القسم البنكي
                </label>
                <Select value={selectedDepartmentId || ""} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.deptName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center gap-2 text-slate-500 px-1">
                  <User className="h-3.5 w-3.5 text-primary" /> اسم الموظف
                </label>
                <Select value={selectedEmployeeId || ""} onValueChange={setSelectedEmployeeId} disabled={!selectedDepartmentId}>
                  <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="اختر اسمك" /></SelectTrigger>
                  <SelectContent>
                    {employees?.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">قائمة الطعام</h2>
            <div className="relative w-40">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="بحث سريع..." 
                className="pr-9 h-9 rounded-full bg-white text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-slate-100 p-1 rounded-xl">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2 font-bold text-xs rounded-lg">
                  <cat.icon className={`h-4 w-4 ${cat.color}`} />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="mt-4 grid grid-cols-1 gap-3">
                {filteredMenu.map((item) => (
                  <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative">
                    <div className={`absolute right-0 top-0 bottom-0 w-1 ${cat.color.replace('text', 'bg')}`} />
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-50 p-2 rounded-lg"><cat.icon className={`h-5 w-5 ${cat.color}`} /></div>
                        <div>
                          <h3 className="font-bold text-sm">{item.itemName}</h3>
                          <p className="text-primary font-black text-xs font-headline">{item.price} ريال</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-full border border-slate-100">
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => updateCart(item.id, -1)} disabled={!cart[item.id]}><Minus className="h-3 w-3" /></Button>
                        <span className="w-4 text-center font-bold text-xs">{cart[item.id] || 0}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-primary" onClick={() => updateCart(item.id, 1)}><Plus className="h-3 w-3" /></Button>
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
        <div className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto z-50">
          <Button className="w-full h-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-between px-6 font-bold text-lg" onClick={handlePlaceOrder}>
            <div className="flex items-center gap-3"><ShoppingCart className="h-5 w-5" /> إرسال الطلب</div>
            <div className="font-headline">{cartTotal} ريال</div>
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}