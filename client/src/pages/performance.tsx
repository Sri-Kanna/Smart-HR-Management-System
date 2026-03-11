import { useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TrendingUp,
  Star,
  Plus,
  Loader2,
  BookOpen,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const performanceSchema = z.object({
  empId: z.coerce.number().min(1, "Employee is required"),
  score: z.coerce.number().min(1).max(10, "Score must be between 1 and 10"),
  reviewDate: z.string().min(1, "Review date is required"),
  topic: z.string().min(2, "Topic is required"),
});

type PerformanceInput = z.infer<typeof performanceSchema>;

function ScoreStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(10)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < score ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-foreground">{score}/10</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 9 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
    score >= 7 ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
    score >= 5 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  const label = score >= 9 ? "Excellent" : score >= 7 ? "Good" : score >= 5 ? "Average" : "Needs Improvement";
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${color}`}>{label}</span>;
}

export default function Performance() {
  const { data: employees } = useEmployees();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["/api/performance"],
    queryFn: async () => {
      const res = await fetch("/api/performance", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch performance reviews");
      return res.json() as Promise<{ id: number; empId: number; score: number; reviewDate: string; topic: string }[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PerformanceInput) => {
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/report"] });
      toast({ title: "Review Added", description: "Performance review saved successfully." });
      setDialogOpen(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const form = useForm<PerformanceInput>({
    resolver: zodResolver(performanceSchema),
    defaultValues: { empId: 0, score: 8, reviewDate: new Date().toISOString().split("T")[0], topic: "" },
  });

  const onSubmit = (data: PerformanceInput) => createMutation.mutate(data);

  const getEmployee = (id: number) => employees?.find((e) => e.id === id);

  const avgScore = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Performance Reviews</h1>
          <p className="text-muted-foreground mt-1">Track and manage employee performance scores.</p>
        </div>
        <Button onClick={() => { form.reset(); setDialogOpen(true); }} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5 mr-2" /> Add Review
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
            <div className="p-2 bg-primary/10 text-primary rounded-lg"><BookOpen className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{reviews?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Score</CardTitle>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30"><Star className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{avgScore} <span className="text-sm font-normal text-muted-foreground">/ 10</span></div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Employees Reviewed</CardTitle>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30"><User className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">
              {reviews ? new Set(reviews.map((r) => r.empId)).size : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews list */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> All Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full h-16 rounded-xl" />)}
            </div>
          ) : reviews?.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <TrendingUp className="w-10 h-10 opacity-30" />
              <p>No reviews yet. Add your first performance review.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {reviews?.map((review) => {
                const emp = getEmployee(review.empId);
                return (
                  <div key={review.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-secondary/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {emp ? emp.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "?"}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{emp?.name ?? `Employee #${review.empId}`}</div>
                      <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{review.topic}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{format(new Date(review.reviewDate), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreStars score={review.score} />
                      <ScoreBadge score={review.score} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Add Performance Review</DialogTitle>
            <DialogDescription>Record a new performance review for an employee.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField control={form.control} name="empId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ? String(field.value) : ""}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl bg-background" data-testid="select-employee">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="score" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score (1-10)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={10} className="h-11 rounded-xl bg-background" {...field} data-testid="input-score" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="reviewDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-11 rounded-xl bg-background" {...field} data-testid="input-review-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="topic" render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic / Review Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Q3 Performance Review" className="h-11 rounded-xl bg-background" {...field} data-testid="input-topic" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl h-11 px-5">Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} className="rounded-xl h-11 px-8 shadow-md shadow-primary/20" data-testid="button-submit-review">
                  {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Review"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
