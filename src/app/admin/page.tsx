
"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { useUIStore } from "@/lib/store";
import { collection, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, ShieldCheck, Users, Building2, UtensilsCrossed, UserPlus, Save, Edit2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AdminPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { userRole } = useUIStore();
  const { toast } = useToast();
  const router = useRouter();

  const isAdmin = userRole === "ADMIN";
  const isSupervisor = userRole === "SUPERVISOR";

  // Form States
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "sandwich" });
  const [newDept, setNewDept] = useState("");
  const [newEmp, setNewEmp] = useState({ name: "", phone: "", deptId: "", role: "Employee", canRotate: true });
  
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setNewItem({ name: "", price: "", category: "sandwich" });
    toast({ title: "تم الحفظ", description: "تمت إضافة الصنف الجديد" });
  };

  const handleAddDept = () => {
    if (!newDept) return;
    addDocumentNonBlocking(collection(db, "departments"), { deptName: newDept });
    setNewDept("");
    toast({ title: "تم الحفظ", description: "تمت إضافة القسم الجديد" });
  };

  const handleAddEmp = () => {
    if (!newEmp.name || !newEmp.phone || !newEmp.deptId) {
      toast({ title: "خطأ", description: "يرجى إكمال بيانات الموظف", variant: "destructive" });
      return;
    }
    addDocumentNonBlocking(collection(db, "employees"), {
      name: newEmp.name,
      phone: newEmp.phone,
      departmentId: newEmp.deptId,
      role: newEmp.role,
      canRotate: newEmp.canRotate,
      isDone: false,
      rotationPriority: employees ? employees.length + 1 : 1
    });
    setNewEmp({ name: "", phone: "", deptId: newEmp.deptId, role: "Employee", canRotate: true });
    toast({ title: "تم الحفظ", description: "تمت إضافة الموظف بنجاح" });
  };

  const handleDelete = (col: string, id: string) => {
    if (!isAdmin) {
      toast({ title: "صلاحية مرفوضة", description: "فقط مدير النظام يمكنه الحذف", variant: "destructive" });
      return;
    }
    deleteDocumentNonBlocking(doc(db, col, id));
    toast({ title: "تم الحذف", description: "تمت إزالة السجل بنجاح" });
  };

  const toggleRotation = (emp: any) => {
    if (!isAdmin) return;
    updateDocumentNonBlocking(doc(db, "employees", emp.id), { canRotate: !emp.canRotate });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />
      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary font-headline">لوحة التحكم</h1>
              <p className="text-[10px] text-slate-500">{isAdmin ? "صلاحية: مدير نظام" : "صلاحية: مشرف قسم"}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue={isAdmin ? "menu" : "employees"} className="w-full">
          <TabsList className="w-full bg-slate-100 p-1 mb-6">
            {isAdmin && <TabsTrigger value="menu" className="flex-1 gap-2"><UtensilsCrossed className="h-4 w-4" /> الأصناف</TabsTrigger>}
            <TabsTrigger value="employees" className="flex-1 gap-2"><Users className="h-4 w-4" /> الموظفين</TabsTrigger>
            {isAdmin && <TabsTrigger value="departments" className="flex-1 gap-2"><Building2 className="h-4 w-4" /> الأقسام</TabsTrigger>}
          </TabsList>

          {isAdmin && (
            <TabsContent value="menu" className="space-y-6">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="bg-slate-50 border-b pb-4"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة صنف طعام</CardTitle></CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="اسم الصنف" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                    <Input type="number" placeholder="السعر" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                  </div>
                  <Select value={newItem.category} onValueChange={val => setNewItem({...newItem, category: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandwich">سندوتشات</SelectItem>
                      <SelectItem value="drink">مشروبات</SelectItem>
                      <SelectItem value="add-on">إضافات</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full font-bold" onClick={handleAddItem}>حفظ الصنف</Button>
                </CardContent>
              </Card>
              <div className="space-y-2">
                {menu?.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center border border-slate-100">
                    <div>
                      <p className="font-bold">{item.itemName}</p>
                      <p className="text-[10px] text-slate-500">{item.category === 'sandwich' ? 'سندوتش' : item.category === 'drink' ? 'مشروب' : 'إضافة'} • {item.price} ريال</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete("menu_items", item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="employees" className="space-y-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="bg-slate-50 border-b pb-4"><CardTitle className="text-sm flex items-center gap-2"><UserPlus className="h-4 w-4" /> تسجيل موظف جديد</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="الاسم الكامل" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
                  <Input placeholder="رقم الهاتف" value={newEmp.phone} onChange={e => setNewEmp({...newEmp, phone: e.target.value})} />
                </div>
                <Select value={newEmp.deptId} onValueChange={id => setNewEmp({...newEmp, deptId: id})}>
                  <SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                  <SelectContent>{departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.deptName}</SelectItem>)}</SelectContent>
                </Select>
                
                {isAdmin && (
                  <div className="flex items-center space-x-2 space-x-reverse bg-slate-50 p-3 rounded-lg">
                    <Checkbox 
                      id="canRotate" 
                      checked={newEmp.canRotate} 
                      onCheckedChange={(checked) => setNewEmp({...newEmp, canRotate: checked as boolean})} 
                    />
                    <Label htmlFor="canRotate" className="text-xs font-bold cursor-pointer">يدخل في دورة التوصيل (النزول)</Label>
                  </div>
                )}

                <Button className="w-full font-bold" onClick={handleAddEmp}><Save className="h-4 w-4 ml-2" /> حفظ الموظف</Button>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {employees?.map(emp => (
                <div key={emp.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <p className="font-bold flex items-center gap-2">
                        {emp.name}
                        {emp.canRotate ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-slate-300" />}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {departments?.find(d => d.id === emp.departmentId)?.deptName || "بدون قسم"} • {emp.canRotate ? "مكلف بالنزول" : "معفي من النزول"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => toggleRotation(emp)} className={emp.canRotate ? "text-green-600" : "text-slate-400"}>
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete("employees", emp.id)}><Trash2 className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="departments" className="space-y-6">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="bg-slate-50 border-b pb-4"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة قسم بنكي جديد</CardTitle></CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex gap-2">
                    <Input placeholder="اسم القسم" value={newDept} onChange={e => setNewDept(e.target.value)} />
                    <Button onClick={handleAddDept}>إضافة</Button>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-2">
                {departments?.map(dept => (
                  <div key={dept.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center border border-slate-100">
                    <p className="font-bold">{dept.deptName}</p>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete("departments", dept.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}

import { RefreshCcw } from "lucide-react";
