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
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const [role, setRole] = useState<string>("");
    const [step, setStep] = useState<'form' | 'code'>('form');
    const [generatedCode, setGeneratedCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && step !== 'code') {
                router.push('/dashboard');
            }
        });
        return () => unsubscribe();
    }, [auth, router, step]);


    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const form = e.target as HTMLFormElement;
        const fullName = (form.elements.namedItem("full-name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        const familyCode = (form.elements.namedItem("family-code") as HTMLInputElement)?.value;
        
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
                    avatarUrl: `https://picsum.photos/seed/${fullName.split(' ')[0]}/200/200`
                };
                batch.set(doc(firestore, "families", familyDocRef.id, "members", user.uid), userProfile);
                
                const gamificationData = { 
                  userId: user.uid, 
                  familyId: familyDocRef.id,
                  points: 50, 
                  level: 1, 
                  badges: [], 
                  savingStreaks: 0 
                };
                batch.set(doc(firestore, "families", familyDocRef.id, "gamification", user.uid), gamificationData);

                await batch.commit();
                
                setGeneratedCode(newFamilyCode);
                setStep('code');
            } else { // Join family
                const familiesRef = collection(firestore, "families");
                const q = query(familiesRef, where("familyCode", "==", familyCode));
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
                    avatarUrl: `https://picsum.photos/seed/${fullName.split(' ')[0]}/200/200`
                };
                batch.set(doc(firestore, "families", familyId, "members", user.uid), userProfile);
                
                const gamificationData = { 
                  userId: user.uid, 
                  familyId: familyId,
                  points: 0, 
                  level: 1, 
                  badges: [], 
                  savingStreaks: 0 
                };
                batch.set(doc(firestore, "families", familyId, "gamification", user.uid), gamificationData);

                await batch.commit();
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
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
                    <CardTitle className="text-2xl font-headline">Welcome to the Family!</CardTitle>
                    <CardDescription>
                        Your family is all set up. Share this code with other members to let them join.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <p className="text-sm text-muted-foreground">Your unique family code is:</p>
                    <div className="flex items-center justify-between rounded-lg border bg-muted p-3">
                        <span className="text-2xl font-bold tracking-widest">{generatedCode}</span>
                        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                            <Copy className="h-5 w-5"/>
                            <span className="sr-only">Copy code</span>
                        </Button>
                    </div>
                     <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                </CardContent>
                 <CardFooter className="justify-center">
                    <div className="text-sm">
                        Finished?{" "}
                        <Link href="/login" className="underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        )
    }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="items-center text-center">
        <AppLogo />
        <CardTitle className="text-2xl font-headline">Create your Account</CardTitle>
        <CardDescription>
          Join your family's financial hub in a few easy steps.
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
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" name="full-name" placeholder="Alex Johnson" required disabled={loading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="alex@example.com"
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required disabled={loading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Your Role</Label>
            <Select required onValueChange={(value: string) => setRole(value)} disabled={loading}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role in the family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ParentCreate">Parent (Create a new family)</SelectItem>
                <SelectItem value="ParentJoin">Parent (Join a family)</SelectItem>
                <SelectItem value="Child">Child (Join a family)</SelectItem>
                <SelectItem value="Viewer">Viewer (Join a family)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(role === 'Child' || role === 'Viewer' || role === 'ParentJoin') && (
            <div className="grid gap-2">
                <Label htmlFor="family-code">Family Code</Label>
                <Input id="family-code" name="family-code" placeholder="Enter code from parent" required disabled={loading} />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!role || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creating Account...' : 'Create an account'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
