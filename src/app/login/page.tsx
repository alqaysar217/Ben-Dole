"use client";

import { useState } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Map phone to email for Firebase Auth dummy email approach
      const email = `${phone}@bank.com`;
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "تم الدخول بنجاح", description: "أهلاً بك في نظام الإدارة" });
      router.push("/admin");
    } catch (error: any) {
      toast({ 
        title: "خطأ في الدخول", 
        description: "يرجى التحقق من رقم الهاتف وكلمة المرور", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 pb-20 flex items-center justify-center min-h-screen">
      <TopNav />
      <main className="p-4 w-full max-w-sm">
        <Card className="border-none shadow-2xl bg-white">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">دخول المشرفين</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">رقم الهاتف</label>
                <Input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  placeholder="77XXXXXXX"
                  required
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">كلمة المرور</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="******"
                  required
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
                {loading ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}