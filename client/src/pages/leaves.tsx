import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEmployees } from "@/hooks/use-employees";
import type { Leave } from "@shared/schema";
import {
  CalendarOff, Plus, Check, X, Trash2, Clock, AlertCircle, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO, differenceInDays } from "date-fns";

const LEAVE_TYPES = ["Annual", "Sick", "Emergency", "Unpaid", "Maternity", "Paternity"];

type LeaveWithName = Leave & { employeeName: string };

const STATUS_STYLES: Record<string, string> = {
  Pending:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const LEAVE_TYPE_STYLES: Record<string, string> = {
  Annual:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Sick:      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Emergency: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Unpaid:    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Maternity: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Paternity: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

function RequestLeaveDialog() {
  const { toast } = useToast();
  const { data: employees = [] } = useEmployees();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ empId: "", leaveType: "Annual", startDate: "", endDate: "", reason: "" });

  const mutation = useMutation({
    mutationFn: (d: typeof form) => apiRequest("POST", "/api/leaves", { ...d, empId: Number(d.empId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      toast({ title: "Leave request submitted" });
      setForm({ empId: "", leaveType: "Annual", startDate: "", endDate: "", reason: "" });
      setOpen(false);
    },
    onError: () => toast({ title: "Failed to submit leave request", variant: "destructive" }),
  });

  const nights = form.startDate && form.endDate
    ? differenceInDays(parseISO(form.endDate), parseISO(form.startDate)) + 1
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl h-10" data-testid="button-request-leave">
          <Plus className="w-4 h-4" /> Request Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Employee *</Label>
            <Select value={form.empId} onValueChange={v => setForm({ ...form, empId: v })}>
              <SelectTrigger data-testid="select-leave-employee"><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Leave Type *</Label>
            <Select value={form.leaveType} onValueChange={v => setForm({ ...form, leaveType: v })}>
              <SelectTrigger data-testid="select-leave-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Input type="date" data-testid="input-leave-start" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>End Date *</Label>
              <Input type="date" data-testid="input-leave-end" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          {nights > 0 && (
            <p className="text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg">
              Duration: <strong>{nights} day{nights !== 1 ? "s" : ""}</strong>
            </p>
          )}
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea data-testid="input-leave-reason" placeholder="Optional reason..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending || !form.empId} data-testid="button-submit-leave">
            {mutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Leaves() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("All");

  const { data: leaveList = [], isLoading } = useQuery<LeaveWithName[]>({ queryKey: ["/api/leaves"] });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/leaves/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      toast({ title: "Leave status updated" });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const deleteLeave = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/leaves/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      toast({ title: "Leave request removed" });
    },
  });

  const filtered = filter === "All" ? leaveList : leaveList.filter(l => l.status === filter);

  const counts = {
    All: leaveList.length,
    Pending: leaveList.filter(l => l.status === "Pending").length,
    Approved: leaveList.filter(l => l.status === "Approved").length,
    Rejected: leaveList.filter(l => l.status === "Rejected").length,
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground text-lg mt-1">Review and manage employee leave requests.</p>
        </div>
        <RequestLeaveDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["All", "Pending", "Approved", "Rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            data-testid={`filter-${s.toLowerCase()}`}
            className={`rounded-2xl p-4 text-left border transition-all ${filter === s ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border/50 bg-card hover:bg-secondary/50"}`}
          >
            <div className="text-2xl font-display font-bold text-foreground">{counts[s]}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{s === "All" ? "Total Requests" : s}</div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        {["All", "Pending", "Approved", "Rejected"].map(s => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            className="rounded-lg h-7 px-3 text-xs"
            onClick={() => setFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Leave List */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center text-muted-foreground">
            <CalendarOff className="w-10 h-10 opacity-30" />
            <p className="font-medium">{filter === "All" ? "No leave requests yet" : `No ${filter.toLowerCase()} requests`}</p>
            {filter === "All" && <p className="text-sm">Click "Request Leave" to submit one.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((leave) => {
            const days = differenceInDays(parseISO(leave.endDate), parseISO(leave.startDate)) + 1;
            return (
              <Card key={leave.id} className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-leave-${leave.id}`}>
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">

                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-secondary-foreground shrink-0">
                    {leave.employeeName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground" data-testid={`text-leave-employee-${leave.id}`}>{leave.employeeName}</span>
                      <Badge className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 ${LEAVE_TYPE_STYLES[leave.leaveType] || ""}`}>
                        {leave.leaveType}
                      </Badge>
                      <Badge className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 ${STATUS_STYLES[leave.status] || ""}`}>
                        {leave.status === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                        {leave.status === "Approved" && <Check className="w-3 h-3 mr-1" />}
                        {leave.status === "Rejected" && <X className="w-3 h-3 mr-1" />}
                        {leave.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(leave.startDate), "MMM d")} – {format(parseISO(leave.endDate), "MMM d, yyyy")}
                      <span className="mx-1.5">·</span>
                      <strong>{days} day{days !== 1 ? "s" : ""}</strong>
                    </div>
                    {leave.reason && (
                      <div className="text-xs text-muted-foreground mt-1 italic truncate">"{leave.reason}"</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {leave.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          className="gap-1.5 h-8 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateStatus.mutate({ id: leave.id, status: "Approved" })}
                          disabled={updateStatus.isPending}
                          data-testid={`button-approve-${leave.id}`}
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          onClick={() => updateStatus.mutate({ id: leave.id, status: "Rejected" })}
                          disabled={updateStatus.isPending}
                          data-testid={`button-reject-${leave.id}`}
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteLeave.mutate(leave.id)}
                      data-testid={`button-delete-leave-${leave.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
