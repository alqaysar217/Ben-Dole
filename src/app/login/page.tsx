
"use client";

import { useState } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/firebase";
import { useUIStore } from "@/lib/store";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Info, ShieldCheck, UserCog } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const auth = useAuth();
  const { setUserRole } = useUIStore();
  const { toast } = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic to distinguish between Admin and Supervisor accounts in Firebase Auth
      // We assume two different email mappings for the same phone based on password provided
      let emailSuffix = "sup";
      let role: "ADMIN" | "SUPERVISOR" = "SUPERVISOR";

      if (password === "adminha892019") {
        emailSuffix = "admin";
        role = "ADMIN";
      }

      const email = `${phone.trim()}_${emailSuffix}@bank.com`;
      await signInWithEmailAndPassword(auth, email, password);
      
      setUserRole(role);
      
      toast({ 
        title: role === "ADMIN" ? "مرحباً كمدير للنظام" : "مرحباً كمشرف قسم", 
        description: "تم تسجيل الدخول بنجاح" 
      });
      
      router.push("/admin");
    } catch (err: any) {
      toast({ 
        title: "خطأ في الدخول", 
        description: "يرجى التأكد من صحة رقم الهاتف وكلمة المرور، وتأكد من إنشاء الحسابات في Firebase Console.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 pb-20 flex items-center justify-center min-h-screen bg-slate-50">
      <TopNav />
      <main className="p-4 w-full max-w-sm">
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="text-center space-y-2 pt-8">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">تسجيل الدخول</CardTitle>
            <p className="text-xs text-slate-500">لوحة تحكم المدراء ومشرفي الأقسام</p>
          </CardHeader>
          <CardContent className="pb-8 space-y-4">
            
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-xs font-bold">تنبيه للمطور</AlertTitle>
              <AlertDescription className="text-[10px] leading-relaxed">
                يجب إنشاء حسابين في <b>Authentication</b>:<br/>
                1. كمدير: <code className="bg-white px-1">775258830_admin@bank.com</code><br/>
                2. كمشرف: <code className="bg-white px-1">775258830_sup@bank.com</code>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 px-1">رقم الهاتف</label>
                <Input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  placeholder="775258830"
                  required
                  className="bg-slate-50 border-slate-200 h-12 text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 px-1">كلمة المرور</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="******"
                  required
                  className="bg-slate-50 border-slate-200 h-12 text-left"
                  dir="ltr"
                />
              </div>
              <Button type="submit" className="w-full h-12 font-bold text-lg shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? "جاري التحقق..." : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary transition-colors">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
