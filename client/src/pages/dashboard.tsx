import { useAnalytics } from "@/hooks/use-analytics";
import { useEmployees } from "@/hooks/use-employees";
import { exportAnalyticsPDF } from "@/lib/pdf-export";
import { 
  Users, 
  TrendingUp, 
  CalendarCheck, 
  Building2,
  Download,
  Cake,
  Percent
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
import { format, differenceInDays, parseISO, setYear } from "date-fns";

function getUpcomingBirthdays(employees: any[], days = 30) {
  const today = new Date();
  return employees
    .map((emp) => {
      if (!emp.dob) return null;
      const dob = parseISO(emp.dob);
      let nextBirthday = setYear(dob, today.getFullYear());
      if (nextBirthday < today) nextBirthday = setYear(dob, today.getFullYear() + 1);
      const daysUntil = differenceInDays(nextBirthday, today);
      return daysUntil <= days ? { ...emp, daysUntil, nextBirthday } : null;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.daysUntil - b.daysUntil);
}

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  const totalEmployees = employees?.length || 0;
  const avgPerformanceOverall = analytics && analytics.length > 0
    ? (analytics.reduce((acc, curr) => acc + parseFloat(curr.averagePerformanceScore || "0"), 0) / analytics.length).toFixed(1)
    : "0.0";
  const totalPresent = analytics?.reduce((sum, item) => sum + item.totalPresentCount, 0) || 0;

  const upcomingBirthdays = employees ? getUpcomingBirthdays(employees) : [];

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
              <div className="text-3xl font-display font-bold text-foreground">{totalEmployees}</div>
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
              <div className="text-3xl font-display font-bold text-foreground">{avgPerformanceOverall} <span className="text-sm font-normal text-muted-foreground">/ 10</span></div>
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
              <div className="text-3xl font-display font-bold text-foreground">{analytics?.length || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chart-4/5 rounded-bl-[100px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Present</CardTitle>
            <div className="p-2 bg-chart-4/10 text-chart-4 rounded-lg"><CalendarCheck className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-display font-bold text-foreground">{totalPresent}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts + Birthday */}
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

        {/* Upcoming Birthdays Widget */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="font-display flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-500" />
              Upcoming Birthdays
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {employeesLoading ? (
              <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-12 rounded-xl" />)}</div>
            ) : upcomingBirthdays.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                <Cake className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No birthdays in the next 30 days.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {(upcomingBirthdays as any[]).map((emp) => (
                  <div key={emp.id} className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {emp.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{format(emp.nextBirthday, "MMM d")}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${emp.daysUntil === 0 ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-secondary text-muted-foreground'}`}>
                      {emp.daysUntil === 0 ? "Today!" : `${emp.daysUntil}d`}
                    </span>
                  </div>
                ))}
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
