
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { UserRole } from "@/lib/types";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLogo } from "@/components/app-logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Loader2, Languages, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { useFamily } from "@/context/family-context";
import { Language } from "@/lib/translations";

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();
    const { refreshFamily, authUser, currentUser, loading: isFamilyLoading, t, language, setLanguage } = useFamily();

    const [role, setRole] = useState<string>("");
    const [step, setStep] = useState<'form' | 'code'>('form');
    const [generatedCode, setGeneratedCode] = useState('');
    const [error, setError] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false);

    useEffect(() => {
      if (!isFamilyLoading && authUser && currentUser) {
        router.push("/dashboard");
      }
    }, [isFamilyLoading, authUser, currentUser, router]);

    const handleGoogleSignup = async () => {
        if (!role) {
            setError("Please select a role first.");
            return;
        }
        setIsSigningUp(true);
        setError("");
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            await completeRegistration(user, user.displayName || "User", role);
        } catch (err: any) {
            setError(err.message);
            setIsSigningUp(false);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsSigningUp(true);

        const form = e.target as HTMLFormElement;
        const fullName = (form.elements.namedItem("full-name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await completeRegistration(userCredential.user, fullName, role);
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError(t.auth.invalidEmail || "This email is already in use. Please log in.");
            } else {
                setError(err.message);
            }
            setIsSigningUp(false);
        }
    };

    const completeRegistration = async (user: any, fullName: string, selectedRole: string) => {
        const batch = writeBatch(firestore);
        const roleForUserObject: UserRole = selectedRole === 'ParentCreate' || selectedRole === 'ParentJoin' ? 'Parent' : selectedRole as UserRole;
        const familyCodeInput = (document.getElementById("family-code") as HTMLInputElement)?.value;

        try {
            if (selectedRole === 'ParentCreate') {
                const familyNamePart = fullName.split(' ').pop() || 'User';
                const newFamilyCode = `${familyNamePart.substring(0, 3).toUpperCase()}-${String(Date.now()).slice(-4)}`;
                const familyDocRef = doc(collection(firestore, "families"));

                const newFamily = {
                    id: familyDocRef.id,
                    familyName: `The ${familyNamePart}s`,
                    familyCode: newFamilyCode,
                    createdByUserId: user.uid,
                    createdAt: new Date().toISOString(),
                    members: {
                        [user.uid]: {
                            role: roleForUserObject,
                            joinedAt: new Date().toISOString()
                        }
                    }
                };
                batch.set(familyDocRef, newFamily);

                // Populate Global Directory for Discovery
                batch.set(doc(firestore, "users", user.uid), {
                  uid: user.uid,
                  familyId: familyDocRef.id,
                  name: fullName,
                  email: user.email
                });

                const userProfile = {
                    id: user.uid,
                    familyId: familyDocRef.id,
                    name: fullName,
                    email: user.email,
                    role: roleForUserObject,
                    avatarUrl: user.photoURL || `https://picsum.photos/seed/${fullName.split(' ')[0]}/200/200`,
                    points: 50,
                    badges: []
                };
                batch.set(doc(firestore, "families", familyDocRef.id, "members", user.uid), userProfile);
                
                await batch.commit();
                setGeneratedCode(newFamilyCode);
                await refreshFamily(familyDocRef.id);
                setStep('code');
            } else { // Join family
                if (!familyCodeInput) {
                    throw new Error("Family code is required to join.");
                }
                const familiesRef = collection(firestore, "families");
                const q = query(familiesRef, where("familyCode", "==", familyCodeInput));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    throw new Error("Invalid family code. Please check and try again.");
                }

                const familyDoc = querySnapshot.docs[0];
                const familyId = familyDoc.id;

                // Populate Global Directory for Discovery
                batch.set(doc(firestore, "users", user.uid), {
                  uid: user.uid,
                  familyId: familyId,
                  name: fullName,
                  email: user.email
                });

                const userProfile = {
                    id: user.uid,
                    familyId: familyId,
                    name: fullName,
                    email: user.email,
                    role: roleForUserObject,
                    avatarUrl: user.photoURL || `https://picsum.photos/seed/${fullName.split(' ')[0]}/200/200`,
                    points: 0,
                    badges: []
                };
                batch.set(doc(firestore, "families", familyId, "members", user.uid), userProfile);
                
                await batch.commit();
                await refreshFamily(familyId);
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
            setIsSigningUp(false);
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        toast({
            title: "Copied!",
            description: "Family code copied to clipboard.",
        });
    };

    if (step === 'code') {
        return (
            <Card className="mx-auto max-w-sm">
                <CardHeader className="items-center text-center">
                    <AppLogo />
                    <CardTitle className="text-2xl font-headline">{t.auth.welcomeFamily}</CardTitle>
                    <CardDescription>
                        {t.auth.shareCode}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <p className="text-sm text-muted-foreground">{t.auth.familyCode}:</p>
                    <div className="flex items-center justify-between rounded-lg border bg-muted p-3">
                        <span className="text-2xl font-bold tracking-widest">{generatedCode}</span>
                        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                            <Copy className="h-5 w-5"/>
                            <span className="sr-only">Copy code</span>
                        </Button>
                    </div>
                     <Button onClick={() => router.push('/dashboard')}>{t.auth.goToDashboard}</Button>
                </CardContent>
            </Card>
        )
    }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
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
      
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-2xl font-headline">{t.auth.createAccount}</CardTitle>
          <CardDescription>
            {t.auth.accessSecure}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
              {error && (
                  <Alert variant="destructive" className="flex flex-col gap-3">
                      <div>
                        <AlertTitle>Signup Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </div>
                      {error.includes("already in use") && (
                        <Button variant="outline" size="sm" asChild className="w-full border-destructive/20 hover:bg-destructive/10 text-destructive">
                           <Link href="/login">Go to Login <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                      )}
                  </Alert>
              )}
            
            <div className="grid gap-2">
              <Label htmlFor="role">{t.auth.role}</Label>
              <Select required onValueChange={(value: string) => setRole(value)} disabled={isSigningUp}>
                <SelectTrigger id="role">
                  <SelectValue placeholder={t.auth.rolePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ParentCreate">{t.auth.parentCreate}</SelectItem>
                  <SelectItem value="ParentJoin">{t.auth.parentJoin}</SelectItem>
                  <SelectItem value="Child">{t.auth.childJoin}</SelectItem>
                  <SelectItem value="Viewer">{t.auth.viewerJoin}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(role === 'Child' || role === 'Viewer' || role === 'ParentJoin') && (
              <div className="grid gap-2">
                  <Label htmlFor="family-code">{t.auth.familyCode}</Label>
                  <Input id="family-code" name="family-code" placeholder="Enter code from parent" required disabled={isSigningUp} />
              </div>
            )}

            <Button 
                variant="outline" 
                className="w-full h-10 border-white/10 hover:bg-white/5" 
                onClick={handleGoogleSignup} 
                disabled={!role || isSigningUp}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Signup with Google
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f0c29] px-2 text-white/30">{t.auth.or}</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="grid gap-4">
                <div className="grid gap-2">
                <Label htmlFor="full-name">{t.auth.fullName}</Label>
                <Input id="full-name" name="full-name" placeholder="Alex Johnson" required disabled={isSigningUp} />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="alex@example.com"
                    required
                    disabled={isSigningUp}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <Input id="password" name="password" type="password" required disabled={isSigningUp} />
                </div>
                <Button type="submit" className="w-full" disabled={!role || isSigningUp}>
                {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSigningUp ? t.auth.creatingAccount : t.auth.createAccount}
                </Button>
            </form>
          </div>
          <div className="mt-4 text-center text-sm">
            {t.auth.alreadyHaveAccount}{" "}
            <Link href="/login" className="underline">
              {t.auth.signIn}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
