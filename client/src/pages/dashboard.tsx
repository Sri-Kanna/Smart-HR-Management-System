import { useAnalytics } from "@/hooks/use-analytics";
import { useEmployees } from "@/hooks/use-employees";
import { exportAnalyticsPDF } from "@/lib/pdf-export";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CompanyEvent } from "@shared/schema";
import { 
  Users, 
  TrendingUp, 
  CalendarCheck, 
  Building2,
  Download,
  CalendarDays,
  MapPin,
  Plus,
  Trash2,
  Percent,
  Tag
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format, differenceInDays, parseISO, isAfter, startOfToday } from "date-fns";

const EVENT_CATEGORIES = ["Conference", "Training", "Team Building", "Workshop", "Meeting", "General"];

const CATEGORY_COLORS: Record<string, string> = {
  Conference:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Training:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Team Building": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Workshop:      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Meeting:       "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  General:       "bg-secondary text-muted-foreground",
};

function daysLabel(eventDate: string) {
  const today = startOfToday();
  const d = parseISO(eventDate);
  const diff = differenceInDays(d, today);
  if (diff === 0) return { label: "Today!", urgent: true };
  if (diff === 1) return { label: "Tomorrow", urgent: true };
  if (diff < 0) return { label: "Past", urgent: false };
  return { label: `In ${diff}d`, urgent: false };
}

function AddEventDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    eventDate: "",
    location: "",
    description: "",
    category: "General",
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("POST", "/api/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event added successfully" });
      onClose();
    },
    onError: () => toast({ title: "Failed to add event", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.eventDate || !form.category) return;
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label htmlFor="event-title">Title *</Label>
        <Input
          id="event-title"
          data-testid="input-event-title"
          placeholder="e.g. Annual Tech Conference"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="event-date">Date *</Label>
          <Input
            id="event-date"
            data-testid="input-event-date"
            type="date"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-category">Category *</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger id="event-category" data-testid="select-event-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="event-location">Location</Label>
        <Input
          id="event-location"
          data-testid="input-event-location"
          placeholder="e.g. Main Conference Hall"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          data-testid="input-event-description"
          placeholder="Brief description..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={mutation.isPending}
        data-testid="button-submit-event"
      >
        {mutation.isPending ? "Adding..." : "Add Event"}
      </Button>
    </form>
  );
}

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: events = [], isLoading: eventsLoading } = useQuery<CompanyEvent[]>({
    queryKey: ["/api/events"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event removed" });
    },
  });

  const today = startOfToday();
  const upcomingEvents = events
    .filter((e) => !isAfter(today, parseISO(e.eventDate)))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  const totalEmployees = employees?.length || 0;
  const avgPerformanceOverall = analytics && analytics.length > 0
    ? (analytics.reduce((acc, curr) => acc + parseFloat(curr.averagePerformanceScore || "0"), 0) / analytics.length).toFixed(1)
    : "0.0";
  const totalPresent = analytics?.reduce((sum, item) => sum + item.totalPresentCount, 0) || 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground text-lg mt-1">Welcome back. Here's what's happening across the organization.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => analytics && exportAnalyticsPDF(analytics)}
          disabled={!analytics || analytics.length === 0}
          className="rounded-xl h-11 px-5 gap-2 shrink-0"
          data-testid="button-export-analytics-pdf"
        >
          <Download className="w-4 h-4" />
          Export Analytics PDF
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <div className="p-2 bg-primary/10 text-primary rounded-lg"><Users className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            {employeesLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-display font-bold text-foreground" data-testid="kpi-total-employees">{totalEmployees}</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/5 rounded-bl-[100px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Performance</CardTitle>
            <div className="p-2 bg-chart-2/10 text-chart-2 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-display font-bold text-foreground" data-testid="kpi-avg-performance">{avgPerformanceOverall} <span className="text-sm font-normal text-muted-foreground">/ 10</span></div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chart-3/5 rounded-bl-[100px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
            <div className="p-2 bg-chart-3/10 text-chart-3 rounded-lg"><Building2 className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-display font-bold text-foreground" data-testid="kpi-departments">{analytics?.length || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chart-4/5 rounded-bl-[100px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
            <div className="p-2 bg-chart-4/10 text-chart-4 rounded-lg"><CalendarCheck className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            {eventsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-display font-bold text-foreground" data-testid="kpi-upcoming-events">{upcomingEvents.length}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <Card className="rounded-2xl border-border/50 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="font-display">Performance by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="w-full h-[280px]" />
            ) : analytics && analytics.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="departmentName" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} domain={[0, 10]} />
                    <RechartsTooltip cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="averagePerformanceScore" name="Avg Score (1-10)" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                    <Bar dataKey="totalPresentCount" name="Present Count" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">No analytics data available</div>
            )}
          </CardContent>
        </Card>

        {/* Company Events Widget */}
        <Card className="rounded-2xl border-border/50 shadow-sm flex flex-col">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between gap-2">
            <CardTitle className="font-display flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Upcoming Events
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1 rounded-lg" data-testid="button-add-event">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Company Event</DialogTitle>
                </DialogHeader>
                <AddEventDialog onClose={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            {eventsLoading ? (
              <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-14 rounded-xl" />)}</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                <CalendarDays className="w-8 h-8 opacity-30" />
                <span>No upcoming events.<br />Click <strong>Add</strong> to schedule one.</span>
              </div>
            ) : (
              <div className="divide-y divide-border/50 max-h-[320px] overflow-y-auto">
                {upcomingEvents.map((event) => {
                  const { label, urgent } = daysLabel(event.eventDate);
                  return (
                    <div
                      key={event.id}
                      data-testid={`event-item-${event.id}`}
                      className="flex items-start gap-3 p-4 hover:bg-secondary/30 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate" data-testid={`event-title-${event.id}`}>{event.title}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(event.eventDate), "MMM d, yyyy")}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.General}`}>
                            <Tag className="w-2.5 h-2.5" />
                            {event.category}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgent ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                            {label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate(event.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground shrink-0"
                        data-testid={`button-delete-event-${event.id}`}
                        title="Remove event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Table */}
      {analytics && analytics.length > 0 && (
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/50 pb-4">
            <CardTitle className="font-display flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              Department Analytics Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="text-left p-4 font-semibold text-muted-foreground">Department</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Avg Performance Score</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Total Present Count</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((row, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-4 font-medium text-foreground">{row.departmentName}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${parseFloat(row.averagePerformanceScore) * 10}%` }} />
                          </div>
                          <span className="font-semibold">{parseFloat(row.averagePerformanceScore).toFixed(1)}</span>
                          <span className="text-muted-foreground">/ 10</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{row.totalPresentCount}</span>
                        <span className="text-muted-foreground"> records</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
