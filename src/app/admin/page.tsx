
"use client";

import { useState } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAppStore, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { menu, addMenuItem, removeMenuItem, role } = useAppStore();
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "Sandwiches" as MenuItem['category']
  });

  if (role === "EMPLOYEE") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>عذراً، لا تملك صلاحية الوصول لهذه الصفحة.</p>
      </div>
    );
  }

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;
    
    addMenuItem({
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      price: parseInt(newItem.price),
      category: newItem.category
    });

    setNewItem({ name: "", price: "", category: newItem.category });
    toast({
      title: "تمت الإضافة",
      description: "تمت إضافة الصنف الجديد للقائمة",
    });
  };

  const categories: MenuItem['category'][] = ["Sandwiches", "Add-ons", "Drinks"];
  const catLabels = {
    "Sandwiches": "سندويتشات",
    "Add-ons": "إضافات",
    "Drinks": "مشروبات"
  };

  return (
    <div className="pt-14 pb-20">
      <TopNav />

      <main className="p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">إدارة القائمة</h1>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">إضافة صنف جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input 
                placeholder="اسم الصنف" 
                value={newItem.name} 
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
              <Input 
                placeholder="السعر (ريال)" 
                type="number"
                value={newItem.price} 
                onChange={e => setNewItem({...newItem, price: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              {categories.map(cat => (
                <Button 
                  key={cat}
                  size="sm"
                  variant={newItem.category === cat ? "default" : "outline"}
                  className="flex-1 text-xs"
                  onClick={() => setNewItem({...newItem, category: cat})}
                >
                  {catLabels[cat]}
                </Button>
              ))}
            </div>
            <Button className="w-full" onClick={handleAddItem}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة للصنف
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="Sandwiches" className="w-full">
          <TabsList className="w-full bg-muted/30">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="flex-1">
                {catLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat} className="space-y-3 mt-4">
              {menu.filter(m => m.category === cat).map(item => (
                <Card key={item.id} className="border-none shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-primary text-sm font-semibold">{item.price} ريال</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-destructive"
                      onClick={() => removeMenuItem(item.id)}
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
