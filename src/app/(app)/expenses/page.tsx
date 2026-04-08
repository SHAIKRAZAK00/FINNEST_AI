
"use client";

import { useMemo, useState, useRef } from "react";
import { useFamily } from "@/context/family-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, Camera, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { expenseCategories } from "@/lib/data";
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { getExpenseFromReceipt } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const HEAVY_AMOUNT_THRESHOLD = 10000;

/**
 * @fileOverview ExpensesPage Component
 * 
 * Demonstrates advanced Frontend UI patterns:
 * 1. State Management: Handling form state, scan state, and alerts.
 * 2. Real-time UI: Table updates automatically via FamilyContext.
 * 3. Validation UX: "Heavy Amount" safeguard before submission.
 * 4. Responsive Design: Mobile-optimized tables and dialogs.
 */
export default function ExpensesPage() {
  const { expenses, users, currentUser, addExpense, deleteExpense, t } = useFamily();
  const [open, setOpen] = useState(false);
  const [showHeavyAmountAlert, setShowHeavyAmountAlert] = useState(false);
  const [newExpense, setNewExpense] = useState({
      description: '',
      amount: '',
      category: '' as ExpenseCategory | ''
  });
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getUserById = (id: string) => users.find((u) => u.id === id);
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("");
  
  const resetForm = () => {
    setNewExpense({ description: '', amount: '', category: '' });
  }

  const handleAddExpenseClick = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please fill all fields." });
        return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
        toast({ variant: "destructive", title: "Invalid Amount", description: "Amount must be greater than zero." });
        return;
    }

    if (amount >= HEAVY_AMOUNT_THRESHOLD) {
      setShowHeavyAmountAlert(true);
    } else {
      executeAddExpense();
    }
  };

  const executeAddExpense = async () => {
    const success = await addExpense({
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category as ExpenseCategory,
    });
    
    if (success) {
        resetForm();
        setOpen(false);
        setShowHeavyAmountAlert(false);
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const dataUri = reader.result as string;
        const result = await getExpenseFromReceipt(dataUri);
        
        if (result.success && result.expense) {
            setNewExpense({
                description: result.expense.description,
                amount: String(result.expense.amount),
                category: result.expense.category,
            });
            toast({ title: "Scan Successful", description: "Details extracted via Gemini Vision." });
        } else {
            toast({ variant: "destructive", title: "Scan Failed", description: result.error });
        }
        setIsScanning(false);
    };
    reader.onerror = () => {
        toast({ variant: "destructive", title: "File Error", description: "Could not read image." });
        setIsScanning(false);
    };
  };

  const canAddExpense = currentUser?.role === 'Parent' || currentUser?.role === 'Child';

  const sortedExpenses = useMemo(() => 
    [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses]
  );

  return (
    <div className="space-y-6">
      <Card className="max-w-full overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-headline flex items-center gap-2">
                <PlusCircle className="h-6 w-6 text-primary" /> {t.expenses.title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.expenses.desc}
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 w-full sm:w-auto shadow-lg shadow-primary/20" disabled={!canAddExpense}>
                <PlusCircle className="h-4 w-4" />
                <span>{t.expenses.addExpense}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t.expenses.dialogTitle}</DialogTitle>
                <DialogDescription>
                  {t.expenses.dialogDesc}
                </DialogDescription>
              </DialogHeader>
              
              <div className="relative grid gap-4 py-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isScanning} className="w-full border-primary/30 text-primary hover:bg-primary/5">
                  <Camera className="mr-2 h-4 w-4" />
                  {t.expenses.scanWithAi}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t.expenses.orManual}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-xs uppercase font-bold text-muted-foreground">{t.expenses.description}</Label>
                    <Input id="description" value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} placeholder={t.expenses.descPlaceholder}/>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount" className="text-xs uppercase font-bold text-muted-foreground">{t.expenses.amount}</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                        <Input id="amount" type="number" className="pl-7" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} placeholder="0.00"/>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-xs uppercase font-bold text-muted-foreground">{t.expenses.category}</Label>
                    <Select value={newExpense.category} onValueChange={(value: ExpenseCategory) => setNewExpense({...newExpense, category: value})}>
                        <SelectTrigger>
                        <SelectValue placeholder={t.expenses.catPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                        {expenseCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                  </div>
                </div>

                {isScanning && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-lg z-50">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm font-bold animate-pulse text-primary">{t.expenses.scanning}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" onClick={handleAddExpenseClick} disabled={isScanning} className="w-full">
                  {isScanning ? t.expenses.pleaseWait : t.expenses.addExpense}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[180px]">{t.expenses.tableContributor}</TableHead>
                  <TableHead>{t.expenses.tableDesc}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t.expenses.tableCat}</TableHead>
                  <TableHead className="hidden md:table-cell">{t.expenses.tableDate}</TableHead>
                  <TableHead className="text-right">{t.expenses.tableAmount}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map((expense) => {
                  const contributor = getUserById(expense.contributorId);
                  const isCreator = currentUser?.id === expense.contributorId;
                  const isParent = currentUser?.role === 'Parent';
                  const canDelete = isCreator || isParent;

                  return (
                    <TableRow key={expense.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border-2 border-primary/10">
                                <AvatarImage src={contributor?.avatarUrl} />
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{contributor ? getInitials(contributor.name) : '??'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-bold text-xs truncate max-w-[100px]">{contributor?.name}</span>
                                <span className="text-[8px] uppercase text-muted-foreground">{contributor?.role}</span>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        <div className="flex flex-col gap-1">
                          <span>{expense.description}</span>
                          <Badge variant="outline" className="sm:hidden w-fit text-[8px] px-1 py-0">{expense.category}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-[10px] font-normal">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs opacity-60">{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right text-sm font-bold font-mono">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">{t.expenses.tableActions}</DropdownMenuLabel>
                            {canDelete && (
                                <DropdownMenuItem 
                                    className="text-destructive font-bold flex items-center gap-2 cursor-pointer"
                                    onClick={() => deleteExpense(expense.id)}
                                >
                                    <Trash2 className="h-4 w-4" /> Delete Transaction
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {sortedExpenses.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-2">
                    <div className="p-4 bg-muted rounded-full">
                        <PlusCircle className="h-8 w-8 text-muted-foreground opacity-20" />
                    </div>
                    <p className="text-sm text-muted-foreground font-headline">No expenses logged in the ledger.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showHeavyAmountAlert} onOpenChange={setShowHeavyAmountAlert}>
        <AlertDialogContent className="border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" /> Heavy Transaction Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
                You are logging a significant expense of <strong>₹{parseFloat(newExpense.amount).toLocaleString('en-IN')}</strong>. 
                This will impact the global family budget. Confirm the accuracy of this entry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Check Again</AlertDialogCancel>
            <AlertDialogAction onClick={executeAddExpense} className="bg-destructive hover:bg-destructive/90 font-bold">
                Confirm Amount
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
