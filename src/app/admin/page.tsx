
"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { useUIStore } from "@/lib/store";
import { collection, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Building2, UtensilsCrossed, UserPlus, Save, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { userRole } = useUIStore();
  const { toast } = useToast();
  const router = useRouter();

  const isAdmin = userRole === "ADMIN";

  // تحويل المستخدم إذا لم يكن مسجلاً للدخول
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // حالات النماذج
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "sandwich" });
  const [newDept, setNewDept] = useState("");
  const [newEmp, setNewEmp] = useState({ name: "", phone: "", deptId: "", role: "Employee", canRotate: true });

  // حالات التعديل
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [editType, setEditType] = useState<"employee" | "menu" | "department" | null>(null);

  const menuQuery = useMemoFirebase(() => collection(db, "menu_items"), [db]);
  const { data: menu } = useCollection(menuQuery);

  const deptsQuery = useMemoFirebase(() => collection(db, "departments"), [db]);
  const { data: departments } = useCollection(deptsQuery);

  const empsQuery = useMemoFirebase(() => collection(db, "employees"), [db]);
  const { data: employees } = useCollection(empsQuery);

  if (isUserLoading || !user) return null;

  const handleAddItem = () => {
    if (!isAdmin) return;
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
    if (!isAdmin) return;
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

    const roleToSave = isAdmin ? newEmp.role : "Employee";

    addDocumentNonBlocking(collection(db, "employees"), {
      name: newEmp.name,
      phone: newEmp.phone,
      departmentId: newEmp.deptId,
      role: roleToSave,
      canRotate: newEmp.canRotate,
      isDone: false,
      rotationPriority: employees ? employees.length + 1 : 1
    });
    
    setNewEmp({ name: "", phone: "", deptId: newEmp.deptId, role: "Employee", canRotate: true });
    toast({ title: "تم الحفظ", description: `تمت إضافة الموظف بصفة ${roleToSave === 'Supervisor' ? 'مشرف' : 'موظف'}` });
  };

  const handleDelete = (id: string, collectionName: string) => {
    if (!isAdmin) return;
    if (confirm("هل أنت متأكد من الحذف؟")) {
      deleteDocumentNonBlocking(doc(db, collectionName, id));
      toast({ title: "تم الحذف", description: "تمت إزالة السجل بنجاح" });
    }
  };

  const startEdit = (entity: any, type: "employee" | "menu" | "department") => {
    if (!isAdmin) return;
    setEditingEntity({ ...entity });
    setEditType(type);
  };

  const handleUpdate = () => {
    if (!isAdmin || !editingEntity || !editType) return;

    let collectionName = "";
    let dataToUpdate = {};

    if (editType === "employee") {
      collectionName = "employees";
      dataToUpdate = {
        name: editingEntity.name,
        phone: editingEntity.phone,
        departmentId: editingEntity.departmentId,
        role: editingEntity.role,
        canRotate: editingEntity.canRotate
      };
    } else if (editType === "menu") {
      collectionName = "menu_items";
      dataToUpdate = {
        itemName: editingEntity.itemName,
        price: parseInt(editingEntity.price),
        category: editingEntity.category
      };
    } else if (editType === "department") {
      collectionName = "departments";
      dataToUpdate = {
        deptName: editingEntity.deptName
      };
    }

    updateDocumentNonBlocking(doc(db, collectionName, editingEntity.id), dataToUpdate);
    setEditingEntity(null);
    setEditType(null);
    toast({ title: "تم التحديث", description: "تم حفظ التعديلات بنجاح" });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />
      <main className="p-4 space-y-6 max-w-2xl mx-auto text-right">
        {/* الهيدر العلوي - محاذاة لليمين */}
        <div className="flex items-center justify-start gap-3">
          <div className="text-right">
            <h1 className="text-2xl font-bold text-primary font-headline">لوحة التحكم</h1>
            <p className="text-[10px] text-slate-500">{isAdmin ? "صلاحية: مدير تطبيق" : "صلاحية: مشرف قسم"}</p>
          </div>
        </div>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="w-full bg-slate-100 p-1 mb-6">
            <TabsTrigger value="employees" className="flex-1 gap-2"><Users className="h-4 w-4" /> الموظفين</TabsTrigger>
            {isAdmin && <TabsTrigger value="menu" className="flex-1 gap-2"><UtensilsCrossed className="h-4 w-4" /> الأصناف</TabsTrigger>}
            {isAdmin && <TabsTrigger value="departments" className="flex-1 gap-2"><Building2 className="h-4 w-4" /> الأقسام</TabsTrigger>}
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-sm flex items-center gap-2 flex-row-reverse">
                  <UserPlus className="h-4 w-4" /> 
                  إضافة موظف أو مشرف جديد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-right">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="الاسم الكامل" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="text-right" />
                  <Input placeholder="رقم الهاتف" value={newEmp.phone} onChange={e => setNewEmp({...newEmp, phone: e.target.value})} className="text-right" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select value={newEmp.deptId} onValueChange={id => setNewEmp({...newEmp, deptId: id})}>
                    <SelectTrigger className="text-right flex-row-reverse"><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                    <SelectContent className="text-right">{departments?.map(d => <SelectItem key={d.id} value={d.id} className="text-right">{d.deptName}</SelectItem>)}</SelectContent>
                  </Select>

                  {isAdmin && (
                    <Select value={newEmp.role} onValueChange={val => setNewEmp({...newEmp, role: val})}>
                      <SelectTrigger className="text-right flex-row-reverse"><SelectValue placeholder="حدد الدور" /></SelectTrigger>
                      <SelectContent className="text-right">
                        <SelectItem value="Employee" className="text-right">موظف</SelectItem>
                        <SelectItem value="Supervisor" className="text-right">مشرف قسم</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg justify-start">
                  <Checkbox 
                    id="canRotate" 
                    checked={newEmp.canRotate} 
                    onCheckedChange={(checked) => setNewEmp({...newEmp, canRotate: checked as boolean})} 
                  />
                  <Label htmlFor="canRotate" className="text-xs font-bold cursor-pointer">هل الموظف مكلف بالنزول؟</Label>
                </div>

                <Button className="w-full font-bold" onClick={handleAddEmp}><Save className="h-4 w-4 ml-2" /> حفظ البيانات</Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-500 px-1 text-right">قائمة الموظفين</h3>
              {employees?.map(emp => (
                <div key={emp.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center border border-slate-100 flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div className="flex flex-col text-right">
                      <p className="font-bold flex items-center gap-2 flex-row-reverse">
                        {emp.name}
                        {emp.role === 'Supervisor' && <span className="bg-blue-100 text-blue-700 text-[8px] px-1 py-0 rounded font-bold">مشرف</span>}
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
                        <Button variant="ghost" size="icon" onClick={() => startEdit(emp, "employee")} title="تعديل">
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id, "employees")} title="حذف">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="menu" className="space-y-6">
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader className="bg-slate-50 border-b pb-4"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة صنف طعام</CardTitle></CardHeader>
                  <CardContent className="space-y-4 pt-6 text-right">
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="اسم الصنف" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="text-right" />
                      <Input type="number" placeholder="السعر" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="text-right" />
                    </div>
                    <Select value={newItem.category} onValueChange={val => setNewItem({...newItem, category: val})}>
                      <SelectTrigger className="w-full text-right flex-row-reverse">
                        <SelectValue placeholder="الفئة" />
                      </SelectTrigger>
                      <SelectContent className="text-right">
                        <SelectItem value="sandwich" className="text-right">سندوتشات</SelectItem>
                        <SelectItem value="drink" className="text-right">مشروبات</SelectItem>
                        <SelectItem value="add-on" className="text-right">إضافات</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full font-bold" onClick={handleAddItem}>حفظ الصنف</Button>
                  </CardContent>
                </Card>
                <div className="space-y-2">
                  {menu?.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center border border-slate-100 flex-row-reverse">
                      <div className="text-right">
                        <p className="font-bold">{item.itemName}</p>
                        <p className="text-[10px] text-slate-500">{item.category === 'sandwich' ? 'سندوتش' : item.category === 'drink' ? 'مشروب' : 'إضافة'} • {item.price} ريال</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(item, "menu")} title="تعديل">
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, "menu_items")} title="حذف">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="departments" className="space-y-6">
                <Card className="border-none shadow-sm bg-white">
                  <CardHeader className="bg-slate-50 border-b pb-4"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة قسم بنكي جديد</CardTitle></CardHeader>
                  <CardContent className="space-y-4 pt-6 text-right">
                    <div className="flex gap-2">
                      <Input placeholder="اسم القسم" value={newDept} onChange={e => setNewDept(e.target.value)} className="text-right" />
                      <Button onClick={handleAddDept}>إضافة</Button>
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-2">
                  {departments?.map(dept => (
                    <div key={dept.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center border border-slate-100 flex-row-reverse">
                      <p className="font-bold text-right w-full">{dept.deptName}</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(dept, "department")} title="تعديل">
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id, "departments")} title="حذف">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* نافذة التعديل المنبثقة */}
        <Dialog open={!!editingEntity} onOpenChange={(open) => !open && setEditingEntity(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل البيانات</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-right">
              {editType === "employee" && editingEntity && (
                <>
                  <div className="space-y-2">
                    <Label>الاسم</Label>
                    <Input value={editingEntity.name} onChange={e => setEditingEntity({...editingEntity, name: e.target.value})} className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label>الهاتف</Label>
                    <Input value={editingEntity.phone} onChange={e => setEditingEntity({...editingEntity, phone: e.target.value})} className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label>القسم</Label>
                    <Select value={editingEntity.departmentId} onValueChange={id => setEditingEntity({...editingEntity, departmentId: id})}>
                      <SelectTrigger className="text-right flex-row-reverse"><SelectValue /></SelectTrigger>
                      <SelectContent className="text-right">{departments?.map(d => <SelectItem key={d.id} value={d.id} className="text-right">{d.deptName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الدور</Label>
                    <Select value={editingEntity.role} onValueChange={val => setEditingEntity({...editingEntity, role: val})}>
                      <SelectTrigger className="text-right flex-row-reverse"><SelectValue /></SelectTrigger>
                      <SelectContent className="text-right">
                        <SelectItem value="Employee" className="text-right">موظف</SelectItem>
                        <SelectItem value="Supervisor" className="text-right">مشرف قسم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 justify-start flex-row-reverse">
                    <Label htmlFor="editRotate" className="cursor-pointer">مكلف بالنزول</Label>
                    <Checkbox id="editRotate" checked={editingEntity.canRotate} onCheckedChange={checked => setEditingEntity({...editingEntity, canRotate: !!checked})} />
                  </div>
                </>
              )}

              {editType === "menu" && editingEntity && (
                <>
                  <div className="space-y-2">
                    <Label>اسم الصنف</Label>
                    <Input value={editingEntity.itemName} onChange={e => setEditingEntity({...editingEntity, itemName: e.target.value})} className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label>السعر</Label>
                    <Input type="number" value={editingEntity.price} onChange={e => setEditingEntity({...editingEntity, price: e.target.value})} className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label>الفئة</Label>
                    <Select value={editingEntity.category} onValueChange={val => setEditingEntity({...editingEntity, category: val})}>
                      <SelectTrigger className="text-right flex-row-reverse"><SelectValue /></SelectTrigger>
                      <SelectContent className="text-right">
                        <SelectItem value="sandwich" className="text-right">سندوتشات</SelectItem>
                        <SelectItem value="drink" className="text-right">مشروبات</SelectItem>
                        <SelectItem value="add-on" className="text-right">إضافات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {editType === "department" && editingEntity && (
                <div className="space-y-2">
                  <Label>اسم القسم</Label>
                  <Input value={editingEntity.deptName} onChange={e => setEditingEntity({...editingEntity, deptName: e.target.value})} className="text-right" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={handleUpdate}>حفظ التعديلات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <BottomNav />
    </div>
  );
}
