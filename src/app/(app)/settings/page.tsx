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
import { Copy, Trash2, Loader2 } from "lucide-react";
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
  const { family, currentUser, users, removeUser, updateUserAvatar } = useFamily();
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  if (!currentUser || !family) {
    return null; // Or a loading state
  }

  return (
    <div className="grid gap-6">
       {currentUser.role === 'Parent' && (
        <Card>
          <CardHeader>
            <CardTitle>Family Settings</CardTitle>
            <CardDescription>Manage your family group and invite members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Family Name</Label>
                <Input value={family.familyName} readOnly />
            </div>
            <div className="space-y-2">
                <Label htmlFor="family-code">Family Code</Label>
                <div className="flex items-center gap-2">
                    <Input id="family-code" value={family.familyCode} readOnly />
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy code</span>
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">Share this code with family members to let them join.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentUser.role === 'Parent' && (
        <Card>
            <CardHeader>
                <CardTitle>Manage Members</CardTitle>
                <CardDescription>Remove members from your family group.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map(user => (
                        <div key={user.id} className="flex items-center justify-between">
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
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" onClick={handlePhotoChangeClick} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={currentUser.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={currentUser.email} />
            </div>
            <Button>Save Changes</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>Customize your FinNest AI experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly summaries and alerts.</p>
                </div>
                <Switch id="email-notifications" defaultChecked/>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get real-time updates on your device.</p>
                </div>
                <Switch id="push-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                </div>
                <Button variant="outline" onClick={() => document.documentElement.classList.toggle('dark')}>
                    Toggle Theme
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Be careful with these actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                <div>
                    <h3 className="font-semibold">Leave Family</h3>
                    <p className="text-sm text-muted-foreground">You will lose access to all shared data.</p>
                </div>
                <Button variant="destructive" disabled={users.filter(u => u.role === 'Parent').length <= 1}>Leave Family</Button>
            </div>
        </CardContent>
      </Card>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently remove <strong>{userToRemove?.name}</strong> from the family. All their associated data, like expenses and goal contributions, will also be deleted. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUserToRemove(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveUser} className={buttonVariants({ variant: "destructive" })}>
                    Remove
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
