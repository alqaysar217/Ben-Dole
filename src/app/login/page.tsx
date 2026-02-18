
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
import { Lock, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Map phone to email for Firebase Auth dummy email approach
      // Format: 775258830 -> 775258830@bank.com
      const email = `${phone.trim()}@bank.com`;
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "تم الدخول بنجاح", description: "أهلاً بك في نظام الإدارة" });
      router.push("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      let message = "يرجى التحقق من رقم الهاتف وكلمة المرور.";
      
      if (err.code === 'auth/invalid-credential') {
        message = "بيانات الدخول غير صحيحة. تأكد من إنشاء الحساب في لوحة تحكم Firebase وتفعيل موفر تسجيل الدخول (Email/Password).";
      } else if (err.code === 'auth/user-not-found') {
        message = "المستخدم غير موجود. يرجى التواصل مع المسؤول.";
      } else if (err.code === 'auth/wrong-password') {
        message = "كلمة المرور خاطئة.";
      }
      
      setError(message);
      toast({ 
        title: "خطأ في الدخول", 
        description: message, 
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
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">دخول المشرفين</CardTitle>
            <p className="text-xs text-slate-500">لوحة التحكم وإدارة الطلبات والتدوير</p>
          </CardHeader>
          <CardContent className="pb-8 space-y-4">
            {error && (
              <Alert variant="destructive" className="text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>تنبيه</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 px-1">رقم الهاتف</label>
                <Input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  placeholder="77XXXXXXX"
                  required
                  className="bg-slate-50 border-slate-200 h-12"
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
                  className="bg-slate-50 border-slate-200 h-12"
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
