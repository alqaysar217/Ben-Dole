
"use client";

import { useState, useEffect } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Settings2, ShieldCheck, Database } from "lucide-react";
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

  // Safely handle redirection in useEffect to avoid "setState during render" warning
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

  const seedInitialData = () => {
    const initialItems = [
      { itemName: "شيبس (بطاطس)", price: 400, category: "sandwiches" },
      { itemName: "بيض مسلوق", price: 600, category: "sandwiches" },
      { itemName: "مربى بالجبن", price: 700, category: "sandwiches" },
      { itemName: "ليمون نعناع", price: 500, category: "drinks" },
      { itemName: "ماء معدني", price: 200, category: "drinks" },
      { itemName: "شطة حارة", price: 100, category: "add-ons" }
    ];

    initialItems.forEach(item => {
      // Check if item already exists to avoid duplicates
      if (!menu?.find(m => m.itemName === item.itemName)) {
        addDocumentNonBlocking(collection(db, "menu_items"), item);
      }
    });
    toast({ title: "تم التهيئة", description: "تمت إضافة البيانات الأولية للقائمة" });
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">لوحة التحكم</h1>
          </div>
          <Button variant="outline" size="sm" onClick={seedInitialData} className="text-xs">
            <Database className="h-4 w-4 ml-2" />
            تهيئة القائمة
          </Button>
        </div>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">إدارة قائمة الطعام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input 
                placeholder="اسم الصنف" 
                value={newItem.name} 
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                className="bg-slate-50"
              />
              <Input 
                placeholder="السعر" 
                type="number"
                value={newItem.price} 
                onChange={e => setNewItem({...newItem, price: e.target.value})}
                className="bg-slate-50"
              />
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
            <Button className="w-full font-bold" onClick={handleAddItem}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة للصنف
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="sandwiches" className="w-full">
          <TabsList className="w-full bg-slate-100">
            <TabsTrigger value="sandwiches" className="flex-1">سندويتشات</TabsTrigger>
            <TabsTrigger value="add-ons" className="flex-1">إضافات</TabsTrigger>
            <TabsTrigger value="drinks" className="flex-1">مشروبات</TabsTrigger>
          </TabsList>

          {["sandwiches", "add-ons", "drinks"].map(cat => (
            <TabsContent key={cat} value={cat} className="space-y-3 mt-4">
              {menu?.filter(m => m.category === cat).map(item => (
                <Card key={item.id} className="border-none shadow-sm bg-white">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-700">{item.itemName}</h3>
                      <p className="text-primary font-headline font-bold text-sm">{item.price.toLocaleString()} ريال</p>
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
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
