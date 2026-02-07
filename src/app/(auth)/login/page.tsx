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
import { mockUsers } from "@/lib/data";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    
    const familyUsersRaw = localStorage.getItem("familyUsers");
    const allUsers = familyUsersRaw ? JSON.parse(familyUsersRaw) : mockUsers;

    const user = allUsers.find((u: any) => u.email === email);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        // For demo, if user not found, let's just log in as the default user
        localStorage.setItem('currentUser', JSON.stringify(mockUsers[0]));
    }
    
    router.push("/dashboard");
  };

  const handleBiometricLogin = () => {
    // For demo purposes, log in as the default user
    const familyUsersRaw = localStorage.getItem("familyUsers");
    const allUsers = familyUsersRaw ? JSON.parse(familyUsersRaw) : mockUsers;
    localStorage.setItem('currentUser', JSON.stringify(allUsers[0]));
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
              defaultValue="alex@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required defaultValue="password" />
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
