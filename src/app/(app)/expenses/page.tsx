
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
import { PlusCircle, MoreHorizontal, Camera, Loader2, Trash2 } from "lucide-react";
import { expenseCategories } from "@/lib/data";
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { getExpenseFromReceipt } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const HEAVY_AMOUNT_THRESHOLD = 10000;

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
    if (!newExpense.description || !newExpense.amount || !newExpense.category) return;

    const amount = parseFloat(newExpense.amount);
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
            toast({
                title: "Scan Successful",
                description: "Receipt details have been filled in. Please review and confirm.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Scan Failed",
                description: result.error || "Could not extract details from the receipt.",
            });
        }
        setIsScanning(false);
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({
            variant: "destructive",
            title: "File Error",
            description: "Could not read the uploaded image.",
        });
        setIsScanning(false);
    };
  };

  const canAddExpense = currentUser?.role === 'Parent' || currentUser?.role === 'Child';

  const sortedExpenses = useMemo(() => 
    [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses]
  );

  return (
    <>
      <Card className="max-w-full overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">{t.expenses.title}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.expenses.desc}
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 w-full sm:w-auto" disabled={!canAddExpense}>
                <PlusCircle className="h-3.5 w-3.5" />
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
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {t.expenses.scanWithAi}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t.expenses.orManual}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right text-xs sm:text-sm">
                    {t.expenses.description}
                  </Label>
                  <Input id="description" value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} className="col-span-3 h-8 sm:h-10" placeholder={t.expenses.descPlaceholder}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right text-xs sm:text-sm">
                    {t.expenses.amount}
                  </Label>
                  <Input id="amount" type="number" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} className="col-span-3 h-8 sm:h-10" placeholder="₹4000"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right text-xs sm:text-sm">
                    {t.expenses.category}
                  </Label>
                  <Select value={newExpense.category} onValueChange={(value: ExpenseCategory) => setNewExpense({...newExpense, category: value})}>
                    <SelectTrigger className="col-span-3 h-8 sm:h-10">
                      <SelectValue placeholder={t.expenses.catPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isScanning && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">{t.expenses.scanning}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" onClick={handleAddExpenseClick} disabled={isScanning} className="w-full sm:w-auto">
                  {isScanning ? t.expenses.pleaseWait : t.expenses.addExpense}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-x-auto">
          <div className="min-w-[600px] sm:min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] sm:w-auto">{t.expenses.tableContributor}</TableHead>
                  <TableHead>{t.expenses.tableDesc}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t.expenses.tableCat}</TableHead>
                  <TableHead className="hidden md:table-cell">{t.expenses.tableDate}</TableHead>
                  <TableHead className="text-right">{t.expenses.tableAmount}</TableHead>
                  <TableHead className="w-[50px]">
                    <span className="sr-only">{t.expenses.tableActions}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map((expense) => {
                  const contributor = getUserById(expense.contributorId);
                  const isCreator = currentUser?.id === expense.contributorId;
                  const isParent = currentUser?.role === 'Parent';
                  const canDelete = isCreator || isParent;

                  return (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                                <AvatarImage src={contributor?.avatarUrl} />
                                <AvatarFallback>{contributor ? getInitials(contributor.name) : t.common.na}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{contributor?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="flex flex-col gap-1">
                          <span>{expense.description}</span>
                          <Badge variant="outline" className="sm:hidden w-fit text-[8px] px-1 py-0">{expense.category}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px]">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right text-xs sm:text-sm font-mono">
                        ₹{expense.amount.toFixed(0)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t.expenses.tableActions}</DropdownMenuLabel>
                            <DropdownMenuItem disabled={!isParent}>Edit</DropdownMenuItem>
                            {canDelete && (
                                <DropdownMenuItem 
                                    className="text-destructive flex items-center gap-2"
                                    onClick={() => deleteExpense(expense.id)}
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
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
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showHeavyAmountAlert} onOpenChange={setShowHeavyAmountAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Is this amount correct?</AlertDialogTitle>
            <AlertDialogDescription>
                You are about to log an expense of <strong>₹{newExpense.amount}</strong>. 
                This is a significant amount for the family budget. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowHeavyAmountAlert(false)}>No, check again</AlertDialogCancel>
            <AlertDialogAction onClick={executeAddExpense}>Yes, it's correct</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
