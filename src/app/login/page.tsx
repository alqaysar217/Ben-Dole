
"use client";

import { useState } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/firebase";
import { useUIStore } from "@/lib/store";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, ShieldCheck, WifiOff } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const auth = useAuth();
  const { setUserRole } = useUIStore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNetworkError(false);

    try {
      let emailSuffix = "sup";
      let role: "ADMIN" | "SUPERVISOR" = "SUPERVISOR";

      // تحديد الدور بناءً على كلمة المرور المطلوبة
      if (password === "adminha892019") {
        emailSuffix = "admin";
        role = "ADMIN";
      }

      const email = `${phone.trim()}_${emailSuffix}@bank.com`;
      
      // محاولة تسجيل الدخول
      await signInWithEmailAndPassword(auth, email, password);
      
      setUserRole(role);

      // إذا كان مشرفاً ويستخدم كلمة السر الافتراضية، نطلب منه التغيير
      if (role === "SUPERVISOR" && password === "123456") {
        setShowChangePassword(true);
        setLoading(false);
        return;
      }
      
      toast({ 
        title: role === "ADMIN" ? "مرحباً كمدير للنظام" : "مرحباً كمشرف قسم", 
        description: "تم تسجيل الدخول بنجاح" 
      });
      
      router.push("/admin");
    } catch (err: any) {
      console.error("Login process error:", err);
      let errorMessage = "يرجى التأكد من صحة رقم الهاتف وكلمة المرور.";
      
      if (err.code === 'auth/network-request-failed') {
        setNetworkError(true);
        errorMessage = "فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك أو التأكد من عدم وجود حظر لخدمات Google.";
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = "بيانات الدخول غير صحيحة. تأكد من إنشاء الحساب في لوحة تحكم Firebase.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "تم حظر الدخول مؤقتاً بسبب محاولات خاطئة كثيرة. حاول لاحقاً.";
      }

      toast({ 
        title: "خطأ في الدخول", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!auth.currentUser || newPassword.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast({ title: "تم التغيير", description: "تم تحديث كلمة المرور بنجاح" });
      setShowChangePassword(false);
      router.push("/admin");
    } catch (err: any) {
      toast({ title: "فشل التحديث", description: err.message, variant: "destructive" });
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
            
            {networkError && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                <WifiOff className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold">مشكلة في الشبكة</AlertTitle>
                <AlertDescription className="text-[10px]">
                  يبدو أنك تواجه مشكلة في الاتصال بخوادم Firebase. تأكد من تشغيل الإنترنت أو استخدام VPN إذا كانت الخدمات محظورة.
                </AlertDescription>
              </Alert>
            )}

            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-xs font-bold">تنبيه للمستخدم</AlertTitle>
              <AlertDescription className="text-[10px] leading-relaxed">
                كلمة السر الافتراضية للمشرف هي <code className="bg-white px-1">123456</code><br/>
                وسيطلب منك النظام تغييرها فور الدخول.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 px-1">رقم الهاتف</label>
                <Input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  placeholder="مثال: 775258830"
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

        <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-primary">تغيير كلمة المرور الافتراضية</DialogTitle>
              <DialogDescription className="text-center">
                يجب عليك تغيير كلمة المرور الافتراضية (123456) لأسباب أمنية قبل المتابعة.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>كلمة المرور الجديدة</Label>
                <Input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="أدخل 6 أحرف على الأقل"
                  className="text-left"
                  dir="ltr"
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full font-bold" onClick={handleUpdatePassword}>تحديث ومتابعة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <BottomNav />
    </div>
  );
}
