
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogo } from "@/components/app-logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFamily } from "@/context/family-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Language } from "@/lib/translations";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { authUser, t, language, setLanguage } = useFamily();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instant redirect as soon as session is identified
  useEffect(() => {
    if (authUser) {
      router.replace("/dashboard");
    }
  }, [authUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // authUser effect will handle the redirect
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: t.auth.loginFailed,
        description: t.auth.invalidEmail,
      });
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md gap-8 px-4">
      <div className="flex flex-col items-center gap-4 w-full">
        <AppLogo />
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <Languages className="h-4 w-4 text-primary" />
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="bg-transparent border-none h-6 text-xs w-[120px] focus:ring-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 items-center text-center opacity-60">
        <p className="text-sm font-medium tracking-[0.2em] uppercase">{t.auth.ecosystem}</p>
      </div>

      <Card className="w-full bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl rounded-[1.5rem]">
        <CardHeader>
          <CardTitle className="text-xl text-center">{t.auth.signIn}</CardTitle>
          <CardDescription className="text-center text-white/50">
            {t.auth.accessSecure}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                  required 
                  disabled={isLoggingIn} 
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-[#a855f7] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all" disabled={isLoggingIn}>
                {isLoggingIn && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isLoggingIn ? t.auth.authenticating : t.auth.signIn}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 items-center">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary/80 uppercase">
          <Shield className="size-4" />
          {t.auth.security}
        </div>
        <div className="text-sm text-white/40">
          {t.auth.newHere}{" "}
          <Link href="/signup" className="text-primary hover:underline font-semibold">
            {t.auth.signUp}
          </Link>
        </div>
      </div>
    </div>
  );
}
