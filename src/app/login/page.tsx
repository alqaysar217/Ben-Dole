
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
import { ArrowRight, WifiOff, Lock, Smartphone, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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

  const loginHero = PlaceHolderImages.find(img => img.id === "login-hero");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNetworkError(false);

    try {
      let emailSuffix = "sup";
      let role: "ADMIN" | "SUPERVISOR" = "SUPERVISOR";

      // تحكم بسيط في الأدوار بناءً على كلمة المرور للتجربة
      if (password === "adminha892019") {
        emailSuffix = "admin";
        role = "ADMIN";
      }

      const email = `${phone.trim()}_${emailSuffix}@bank.com`;
      await signInWithEmailAndPassword(auth, email, password);
      setUserRole(role);

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
      let errorMessage = "يرجى التأكد من صحة البيانات.";
      
      if (err.code === 'auth/network-request-failed') {
        setNetworkError(true);
        errorMessage = "فشل الاتصال بالخادم. يرجى التحقق من الإنترنت.";
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = "بيانات الدخول غير صحيحة.";
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
      toast({ title: "فشل التحديث", description: "حدث خطأ أثناء تحديث كلمة المرور", variant: "destructive" });
    }
  };

  return (
    <div className="pt-16 pb-28 min-h-screen bg-[#F4F6FA] flex items-center justify-center p-6">
      <TopNav />
      <main className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-700">
        <Card className="border-none premium-shadow bg-white rounded-[40px] overflow-hidden">
          {/* الصورة الإنفوجرافيك الرسومية */}
          <div className="relative w-full h-56 bg-primary/5">
            {loginHero && (
              <Image
                src={loginHero.imageUrl}
                alt={loginHero.description}
                fill
                className="object-contain p-6 transition-all hover:scale-105 duration-700"
                priority
                data-ai-hint={loginHero.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          <CardHeader className="text-center space-y-2 -mt-10 relative z-10 px-8">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black text-slate-800 font-headline">تسجيل الدخول</CardTitle>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">للموظفين المصرح لهم فقط</p>
            </div>
          </CardHeader>
          
          <CardContent className="pb-10 space-y-6 px-8">
            
            {networkError && (
              <Alert variant="destructive" className="bg-red-50 border-none text-red-600 rounded-2xl">
                <WifiOff className="h-4 w-4" />
                <AlertTitle className="text-xs font-black uppercase">مشكلة في الاتصال</AlertTitle>
                <AlertDescription className="text-[10px] font-medium leading-relaxed">
                  فشل الاتصال بخدمات Firebase. يرجى التأكد من استقرار الإنترنت.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2 text-right">
                <label className="text-[11px] font-black text-slate-400 px-1 uppercase tracking-widest flex items-center gap-2 justify-end">
                  رقم الهاتف <Smartphone className="h-3.5 w-3.5" />
                </label>
                <Input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  placeholder="777111222"
                  required
                  className="bg-[#F4F6FA] border-none h-14 rounded-2xl text-right font-mono font-bold tracking-widest input-glow"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2 text-right">
                <label className="text-[11px] font-black text-slate-400 px-1 uppercase tracking-widest flex items-center gap-2 justify-end">
                  كلمة المرور <Lock className="h-3.5 w-3.5" />
                </label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-[#F4F6FA] border-none h-14 rounded-2xl text-left font-mono font-bold tracking-[0.4em] input-glow"
                  dir="ltr"
                />
              </div>
              <Button type="submit" className="w-full h-16 bg-glossy-gradient rounded-[22px] font-black text-lg premium-shadow transition-all active:scale-95" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "دخول آمن"}
              </Button>
            </form>

            <div className="pt-4 text-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-primary transition-all rounded-full px-6">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  <span className="font-bold">العودة للرئيسية</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
          <DialogContent className="sm:max-w-md rounded-[32px] border-none premium-shadow p-8">
            <DialogHeader className="text-center space-y-4">
              <div className="bg-primary/10 p-4 rounded-[22px] w-fit mx-auto">
                <Lock className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <DialogTitle className="text-2xl font-black text-primary font-headline">تحديث كلمة المرور</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                لأمان حسابك، يرجى تغيير كلمة المرور الافتراضية الآن.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2 text-right">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">كلمة المرور الجديدة</Label>
                <Input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="أدخل 6 أحرف على الأقل"
                  className="bg-[#F4F6FA] border-none h-14 rounded-2xl text-left font-mono font-bold tracking-[0.3em] input-glow"
                  dir="ltr"
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-14 bg-glossy-gradient rounded-2xl font-black text-lg premium-shadow transition-all active:scale-95" onClick={handleUpdatePassword}>تحديث ومتابعة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <BottomNav />
    </div>
  );
}
