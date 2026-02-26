"use client";

import { useState, useRef } from "react";
import { useFamily } from "@/context/family-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Copy, Trash2, Loader2, Wallet, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "@/lib/types";

export default function SettingsPage() {
  const { family, currentUser, users, removeUser, updateUserAvatar, setAllowance } = useFamily();
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for allowance inputs
  const [allowanceValues, setAllowanceValues] = useState<Record<string, string>>({});

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("");

  const handleCopy = () => {
    if (!family) return;
    navigator.clipboard.writeText(family.familyCode);
    toast({
      title: "Copied!",
      description: "Family code copied to clipboard.",
    });
  };

  const openRemoveDialog = (user: User) => {
    setUserToRemove(user);
    setIsAlertOpen(true);
  };

  const handleRemoveUser = () => {
    if (!userToRemove) return;
    
    const parents = users.filter(u => u.role === 'Parent');
    if (parents.length === 1 && parents[0].id === userToRemove.id) {
       toast({
        variant: "destructive",
        title: "Action Not Allowed",
        description: "You cannot remove the only parent from the family.",
      });
      setIsAlertOpen(false);
      setUserToRemove(null);
      return;
    }

    removeUser(userToRemove.id);
    toast({
      title: "User Removed",
      description: `${userToRemove.name} has been removed from the family.`,
    });
    setIsAlertOpen(false);
    setUserToRemove(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateUserAvatar(dataUrl);
      setIsUploading(false);
      toast({
        title: "Photo updated!",
        description: "Your new profile photo has been saved.",
      });
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({
            variant: "destructive",
            title: "File Error",
            description: "Could not read the uploaded image.",
        });
        setIsUploading(false);
    };
  };

  const handlePhotoChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleSetAllowance = (childId: string) => {
    const value = allowanceValues[childId];
    if (!value) return;
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount >= 0) {
      setAllowance(childId, amount);
    }
  };

  if (!currentUser || !family) {
    return null;
  }

  const children = users.filter(u => u.role === 'Child');

  return (
    <div className="grid gap-6 max-w-4xl mx-auto">
       {currentUser.role === 'Parent' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Allowance Management
            </CardTitle>
            <CardDescription>Set individual monthly virtual allowances for your children.</CardDescription>
          </CardHeader>
          <CardContent>
            {children.length > 0 ? (
                <div className="space-y-6">
                    {children.map(child => (
                        <div key={child.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-background border border-border gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-primary/20">
                                    <AvatarImage src={child.avatarUrl} alt={child.name} />
                                    <AvatarFallback>{getInitials(child.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{child.name}</p>
                                    <p className="text-[10px] uppercase text-muted-foreground">Child Member</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                                    <Input 
                                        type="number" 
                                        className="pl-7" 
                                        placeholder="Amount"
                                        value={allowanceValues[child.id] || ""}
                                        onChange={(e) => setAllowanceValues({...allowanceValues, [child.id]: e.target.value})}
                                    />
                                </div>
                                <Button size="sm" onClick={() => handleSetAllowance(child.id)}>
                                    <Save className="h-4 w-4 mr-2" /> Set
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No child accounts found in this family.</p>
            )}
          </CardContent>
        </Card>
      )}

      {currentUser.role === 'Parent' && (
        <Card>
          <CardHeader>
            <CardTitle>Family Protocol</CardTitle>
            <CardDescription>Manage your family identity and recruitment code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Family Designation</Label>
                <Input value={family.familyName} readOnly />
            </div>
            <div className="space-y-2">
                <Label htmlFor="family-code">Synchronization Code</Label>
                <div className="flex items-center gap-2">
                    <Input id="family-code" value={family.familyCode} readOnly className="font-mono tracking-widest text-lg" />
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy code</span>
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this code to onboard new members into the ecosystem.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentUser.role === 'Parent' && (
        <Card>
            <CardHeader>
                <CardTitle>Network Members</CardTitle>
                <CardDescription>Manage authorized users in your family network.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                           <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{user.name} {user.id === currentUser.id && '(You)'}</p>
                                    <p className="text-sm text-muted-foreground">{user.role}</p>
                                </div>
                            </div>
                            {user.id !== currentUser.id && (
                              <Button variant="ghost" size="icon" onClick={() => openRemoveDialog(user)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove {user.name}</span>
                              </Button>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Individual Profile</CardTitle>
          <CardDescription>Update your personal identity parameters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={(e) => e.preventDefault()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary/10">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" onClick={handlePhotoChangeClick} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Designation</Label>
              <Input id="name" defaultValue={currentUser.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Encrypted Email</Label>
              <Input id="email" type="email" defaultValue={currentUser.email} readOnly className="opacity-60" />
            </div>
            <Button className="w-full sm:w-auto">Update Profile</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Interface Customization</CardTitle>
          <CardDescription>Tailor the FinNest AI visual experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="email-notifications">Email Summaries</Label>
                    <p className="text-xs text-muted-foreground">Receive weekly financial performance briefs.</p>
                </div>
                <Switch id="email-notifications" defaultChecked/>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="push-notifications">Push Alerts</Label>
                    <p className="text-xs text-muted-foreground">Real-time status updates on budget and goals.</p>
                </div>
                <Switch id="push-notifications" defaultChecked />
            </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">System Termination</CardTitle>
          <CardDescription>Irreversible destructive actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4 bg-background">
                <div>
                    <h3 className="font-semibold">Exit Family Network</h3>
                    <p className="text-xs text-muted-foreground">Sever ties and lose access to all shared family intelligence.</p>
                </div>
                <Button variant="destructive" disabled={users.filter(u => u.role === 'Parent').length <= 1}>Exit</Button>
            </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Execute Removal?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently eject <strong>{userToRemove?.name}</strong> from the family network. This operation cannot be reversed.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUserToRemove(null)}>Abort</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveUser} className={buttonVariants({ variant: "destructive" })}>
                    Confirm Ejection
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
