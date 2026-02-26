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
  CardFooter,
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
import { Copy, Loader2, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
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

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsSigningUp(true);

        const form = e.target as HTMLFormElement;
        const fullName = (form.elements.namedItem("full-name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        const familyCodeInput = (form.elements.namedItem("family-code") as HTMLInputElement)?.value;
        
        const roleForUserObject: UserRole = role === 'ParentCreate' || role === 'ParentJoin' ? 'Parent' : role as UserRole;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const batch = writeBatch(firestore);

            if (role === 'ParentCreate') {
                const familyNamePart = fullName.split(' ').pop() || 'User';
                const newFamilyCode = `${familyNamePart.substring(0, 3).toUpperCase()}-${String(Date.now()).slice(-4)}`;
                const familyDocRef = doc(collection(firestore, "families"));

                const newFamily = {
                    id: familyDocRef.id,
                    familyName: `The ${familyNamePart}s`,
                    familyCode: newFamilyCode,
                    createdBy: user.uid,
                };
                batch.set(familyDocRef, newFamily);

                const userProfile = {
                    id: user.uid,
                    familyId: familyDocRef.id,
                    name: fullName,
                    email: user.email,
                    role: roleForUserObject,
                    avatarUrl: `https://picsum.photos/seed/${fullName.split(' ')[0]}/200/200`,
                    points: 50,
                    badges: []
                };
                batch.set(doc(firestore, "families", familyDocRef.id, "members", user.uid), userProfile);
                
                const gamificationData = { 
                  id: user.uid,
                  userId: user.uid, 
                  familyId: familyDocRef.id,
                  points: 50, 
                  level: 1, 
                  savingStreaks: 0 
                };
                batch.set(doc(firestore, "families", familyDocRef.id, "gamification", user.uid), gamificationData);

                await batch.commit();
                
                setGeneratedCode(newFamilyCode);
                await refreshFamily(familyDocRef.id);
                setStep('code');
            } else { // Join family
                const familiesRef = collection(firestore, "families");
                const q = query(familiesRef, where("familyCode", "==", familyCodeInput));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    throw new Error("Invalid family code. Please check and try again.");
                }

                const familyDoc = querySnapshot.docs[0];
                const familyId = familyDoc.id;

                const userProfile = {
                    id: user.uid,
                    familyId: familyId,
                    name: fullName,
                    email: user.email,
                    role: roleForUserObject,
                    avatarUrl: `https://picsum.photos/seed/${fullName.split(' ')[0]}/200/200`,
                    points: 0,
                    badges: []
                };
                batch.set(doc(firestore, "families", familyId, "members", user.uid), userProfile);
                
                const gamificationData = { 
                  id: user.uid,
                  userId: user.uid, 
                  familyId: familyId,
                  points: 0, 
                  level: 1, 
                  savingStreaks: 0 
                };
                batch.set(doc(firestore, "families", familyId, "gamification", user.uid), gamificationData);

                await batch.commit();
                await refreshFamily(familyId);
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
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
                 <CardFooter className="justify-center">
                    <div className="text-sm">
                        {t.auth.alreadyHaveAccount}{" "}
                        <Link href="/login" className="underline">
                            {t.auth.signIn}
                        </Link>
                    </div>
                </CardFooter>
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
          <form onSubmit={handleSignup} className="grid gap-4">
              {error && (
                  <Alert variant="destructive">
                      <AlertTitle>Signup Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}
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

            <Button type="submit" className="w-full" disabled={!role || isSigningUp}>
              {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSigningUp ? t.auth.creatingAccount : t.auth.createAccount}
            </Button>
          </form>
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