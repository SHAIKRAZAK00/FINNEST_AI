"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserRole, Family, User } from "@/lib/types";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [role, setRole] = useState<string>("");
    const [step, setStep] = useState<'form' | 'code'>('form');
    const [generatedCode, setGeneratedCode] = useState('');
    const [error, setError] = useState('');

    const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const form = e.target as HTMLFormElement;
        const fullName = (form.elements.namedItem("full-name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const familyCode = (form.elements.namedItem("family-code") as HTMLInputElement)?.value;
        
        const familiesRaw = localStorage.getItem('families');
        const allFamilies = familiesRaw ? JSON.parse(familiesRaw) : [];
        const usersRaw = localStorage.getItem('familyUsers');
        let allUsers = usersRaw ? JSON.parse(usersRaw) : [];

        const roleForUserObject: UserRole = role === 'ParentCreate' || role === 'ParentJoin' ? 'Parent' : role as UserRole;

        if (role === 'ParentCreate') {
            const familyNamePart = fullName.split(' ').pop() || 'User';
            const newFamilyCode = `${familyNamePart.substring(0, 3).toUpperCase()}-${String(Date.now()).slice(-4)}`;
            const familyId = `family-${Date.now()}`;
            
            const newFamily: Family = {
                id: familyId,
                name: `The ${familyNamePart}s`,
                familyName: `${familyNamePart} Family`,
                familyCode: newFamilyCode,
            };

            const newUser: User = {
              id: `user-${Date.now()}`,
              familyId: familyId,
              name: fullName,
              email,
              avatarUrl: `https://picsum.photos/seed/${fullName.split(' ')[0]}/200/200`,
              points: 0,
              role: 'Parent',
            };

            allFamilies.push(newFamily);
            allUsers.push(newUser);

            localStorage.setItem('families', JSON.stringify(allFamilies));
            localStorage.setItem('familyUsers', JSON.stringify(allUsers));
            localStorage.setItem('family', JSON.stringify(newFamily));
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            setGeneratedCode(newFamilyCode);
            setStep('code');
        } else if (role === 'Child' || role === 'Viewer' || role === 'ParentJoin') {
            const familyToJoin = allFamilies.find((f: Family) => f.familyCode === familyCode);

            if (familyToJoin) {
                const newUser: User = {
                  id: `user-${Date.now()}`,
                  familyId: familyToJoin.id,
                  name: fullName,
                  email,
                  avatarUrl: `https://picsum.photos/seed/${fullName.split(' ')[0]}/200/200`,
                  points: 0,
                  role: roleForUserObject,
                };
                
                allUsers.push(newUser);
                localStorage.setItem('familyUsers', JSON.stringify(allUsers));
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                localStorage.setItem('family', JSON.stringify(familyToJoin));
                router.push('/dashboard');
            } else {
                setError('Invalid family code. Please check with your parent and try again.');
            }
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
          <div className="grid gap-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" name="full-name" placeholder="Alex Johnson" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="alex@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required/>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Your Role</Label>
            <Select required onValueChange={(value: string) => setRole(value)}>
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
                <Input id="family-code" name="family-code" placeholder="Enter code from parent" required />
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={!role}>
            Create an account
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
