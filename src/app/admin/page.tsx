
"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, query, getDocs, writeBatch } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Settings2, ShieldCheck, Database, Users, Building2, UtensilsCrossed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [newItem, setNewItem] = useState({ name: "", price: "", category: "sandwiches" });

  const menuQuery = useMemoFirebase(() => collection(db, "menu_items"), [db]);
  const { data: menu } = useCollection(menuQuery);

  const deptsQuery = useMemoFirebase(() => collection(db, "departments"), [db]);
  const { data: departments } = useCollection(deptsQuery);

  const empsQuery = useMemoFirebase(() => collection(db, "employees"), [db]);
  const { data: employees } = useCollection(empsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) return null;

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;
    
    addDocumentNonBlocking(collection(db, "menu_items"), {
      itemName: newItem.name,
      price: parseInt(newItem.price),
      category: newItem.category
    });

    setNewItem({ ...newItem, name: "", price: "" });
    toast({ title: "تمت الإضافة", description: "تمت إضافة الصنف الجديد للقائمة" });
  };

  const handleRemoveItem = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "menu_items", id));
    toast({ title: "تم الحذف", description: "تمت إزالة الصنف من القائمة" });
  };

  const seedFullSystem = async () => {
    try {
      // 1. Seed Menu Items
      const initialItems = [
        { itemName: "شيبس (بطاطس)", price: 400, category: "sandwiches" },
        { itemName: "بيض مسلوق", price: 600, category: "sandwiches" },
        { itemName: "مربى بالجبن", price: 700, category: "sandwiches" },
        { itemName: "ليمون نعناع", price: 500, category: "drinks" },
        { itemName: "ماء معدني", price: 200, category: "drinks" },
        { itemName: "شطة حارة", price: 100, category: "add-ons" }
      ];

      for (const item of initialItems) {
        if (!menu?.find(m => m.itemName === item.itemName)) {
          addDocumentNonBlocking(collection(db, "menu_items"), item);
        }
      }

      // 2. Seed Departments
      const initialDepts = [
        { id: "dept_it", deptName: "تقنية المعلومات" },
        { id: "dept_ops", deptName: "العمليات المصرفية" },
        { id: "dept_cs", deptName: "خدمة العملاء" }
      ];

      for (const dept of initialDepts) {
        if (!departments?.find(d => d.deptName === dept.deptName)) {
          addDocumentNonBlocking(collection(db, "departments"), { deptName: dept.deptName });
        }
      }

      // 3. Seed some Employees (Wait for depts to be available or use dummy logic)
      toast({ title: "جاري التهيئة", description: "يتم الآن إعداد الأقسام والأصناف..." });

      // Note: For a real demo, we'd wait for IDs, but for MVP we'll just seed basic structure.
      // If departments are already there, we can map employees to the first one found.
      if (departments && departments.length > 0) {
        const firstDeptId = departments[0].id;
        const initialEmps = [
          { name: "أحمد محمد (مدير)", phone: "775258830", departmentId: firstDeptId, role: "Admin", canRotate: true, isDone: false, rotationPriority: 1 },
          { name: "خالد علوي (مشرف)", phone: "771234567", departmentId: firstDeptId, role: "Supervisor", canRotate: true, isDone: false, rotationPriority: 2 },
          { name: "سعيد صالح (موظف)", phone: "770000000", departmentId: firstDeptId, role: "Employee", canRotate: true, isDone: false, rotationPriority: 3 }
        ];

        for (const emp of initialEmps) {
          if (!employees?.find(e => e.name === emp.name)) {
            addDocumentNonBlocking(collection(db, "employees"), emp);
          }
        }
      }

      toast({ title: "تمت التهيئة بنجاح", description: "النظام جاهز الآن للاختبار بكافة الأدوار" });
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في تهيئة البيانات", variant: "destructive" });
    }
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary font-headline">لوحة التحكم</h1>
          </div>
          <Button variant="outline" size="sm" onClick={seedFullSystem} className="text-xs bg-white shadow-sm border-primary/20 hover:bg-primary/5">
            <Database className="h-4 w-4 ml-2 text-primary" />
            تهيئة النظام بالكامل
          </Button>
        </div>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="w-full bg-slate-100 p-1 mb-6">
            <TabsTrigger value="menu" className="flex-1 gap-2">
              <UtensilsCrossed className="h-4 w-4" /> القائمة
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex-1 gap-2">
              <Users className="h-4 w-4" /> الموظفين
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex-1 gap-2">
              <Building2 className="h-4 w-4" /> الأقسام
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> إضافة صنف جديد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 mr-1">اسم الصنف</label>
                    <Input 
                      placeholder="مثلاً: كبدة" 
                      value={newItem.name} 
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 mr-1">السعر (ريال)</label>
                    <Input 
                      placeholder="800" 
                      type="number"
                      value={newItem.price} 
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {["sandwiches", "add-ons", "drinks"].map(cat => (
                    <Button 
                      key={cat}
                      size="sm"
                      variant={newItem.category === cat ? "default" : "outline"}
                      className="flex-1 text-xs"
                      onClick={() => setNewItem({...newItem, category: cat})}
                    >
                      {cat === "sandwiches" ? "سندويتشات" : cat === "add-ons" ? "إضافات" : "مشروبات"}
                    </Button>
                  ))}
                </div>
                <Button className="w-full font-bold h-11" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 ml-2" />
                  حفظ الصنف
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="font-bold text-slate-700 px-1">الأصناف الحالية</h2>
              <div className="grid grid-cols-1 gap-3">
                {menu?.map(item => (
                  <Card key={item.id} className="border-none shadow-sm bg-white">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/5 p-2 rounded-lg">
                          <UtensilsCrossed className="h-5 w-5 text-primary/60" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-700">{item.itemName}</h3>
                          <p className="text-primary font-headline font-bold text-sm">{item.price.toLocaleString()} ريال</p>
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/5"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <div className="space-y-4">
              {employees?.map(emp => (
                <Card key={emp.id} className="border-none shadow-sm bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{emp.name}</h3>
                        <p className="text-xs text-slate-500">{emp.role} • {emp.phone}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!employees || employees.length === 0) && (
                <div className="text-center py-10 text-slate-400">لا يوجد موظفون، استخدم زر التهيئة أعلاه</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="departments">
            <div className="space-y-4">
              {departments?.map(dept => (
                <Card key={dept.id} className="border-none shadow-sm bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-slate-800">{dept.deptName}</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
