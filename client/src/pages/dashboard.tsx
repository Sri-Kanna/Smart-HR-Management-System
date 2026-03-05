import { useAnalytics } from "@/hooks/use-analytics";
import { useEmployees } from "@/hooks/use-employees";
import { 
  Users, 
  TrendingUp, 
  CalendarCheck, 
  Building2 
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  const totalEmployees = employees?.length || 0;
  const avgPerformanceOverall = analytics && analytics.length > 0
    ? (analytics.reduce((acc, curr) => acc + parseFloat(curr.averagePerformanceScore || "0"), 0) / analytics.length).toFixed(1)
    : "0.0";

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome back. Here's what's happening across the organization today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {employeesLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-display font-bold text-foreground">{totalEmployees}</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/5 rounded-bl-[100px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Performance</CardTitle>
            <div className="p-2 bg-chart-2/10 text-chart-2 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-display font-bold text-foreground">{avgPerformanceOverall} <span className="text-sm font-normal text-muted-foreground">/ 10</span></div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chart-3/5 rounded-bl-[100px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Departments</CardTitle>
            <div className="p-2 bg-chart-3/10 text-chart-3 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-display font-bold text-foreground">{analytics?.length || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chart-4/5 rounded-bl-[100px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Present</CardTitle>
            <div className="p-2 bg-chart-4/10 text-chart-4 rounded-lg">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
             {analyticsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-display font-bold text-foreground">
                {analytics?.reduce((sum, item) => sum + item.totalPresentCount, 0) || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">Average Performance by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : analytics && analytics.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="departmentName" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      domain={[0, 10]}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
                    />
                    <Bar 
                      dataKey="averagePerformanceScore" 
                      name="Score (1-10)" 
                      fill="hsl(var(--primary))" 
                      radius={[6, 6, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No analytics data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">Total Present by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : analytics && analytics.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="departmentName" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
                    />
                    <Bar 
                      dataKey="totalPresentCount" 
                      name="Present Count" 
                      fill="hsl(var(--chart-2))" 
                      radius={[6, 6, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
