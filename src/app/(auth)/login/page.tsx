"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fingerprint } from "lucide-react";

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
import { AppLogo } from "@/components/app-logo";
import type { User, Family } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    
    const familyUsersRaw = localStorage.getItem("familyUsers");
    const allUsers = familyUsersRaw ? JSON.parse(familyUsersRaw) : [];

    const user = allUsers.find((u: User) => u.email === email);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        const familiesRaw = localStorage.getItem("families");
        const allFamilies = familiesRaw ? JSON.parse(familiesRaw) : [];
        const family = allFamilies.find((f: Family) => f.id === user.familyId);

        if (family) {
            localStorage.setItem('family', JSON.stringify(family));
        } else {
            localStorage.removeItem('family');
        }
        router.push("/dashboard");
    } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "No user found with that email. Please sign up.",
        });
    }
  };

  const handleBiometricLogin = () => {
    const familyUsersRaw = localStorage.getItem("familyUsers");
    if (!familyUsersRaw || JSON.parse(familyUsersRaw).length === 0) {
        toast({
            variant: "destructive",
            title: "Biometric Login Failed",
            description: "No users found on this device. Please sign in manually first.",
        });
        return;
    }
    const allUsers = JSON.parse(familyUsersRaw);
    const defaultUser = allUsers[0]; // Log in as first user found.
    localStorage.setItem('currentUser', JSON.stringify(defaultUser));
    
    const familiesRaw = localStorage.getItem("families");
    const allFamilies = familiesRaw ? JSON.parse(familiesRaw) : [];
    const family = allFamilies.find((f: Family) => f.id === defaultUser.familyId);
    
    if (family) {
        localStorage.setItem('family', JSON.stringify(family));
    } else {
        localStorage.removeItem('family');
    }

    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <AppLogo />
        <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access your family's finances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="alex@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <div className="flex items-center">
            <Link href="#" className="ml-auto inline-block text-sm underline">
              Forgot your password?
            </Link>
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleBiometricLogin}>
          <Fingerprint className="mr-2 h-4 w-4" />
          Login with Biometrics
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <div className="text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
