import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, Building2, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEmployees } from "@/hooks/use-employees";

type PayrollRow = {
  departmentName: string;
  headcount: number;
  totalMonthlyPayroll: number;
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function Payroll() {
  const { data: rows = [], isLoading } = useQuery<PayrollRow[]>({ queryKey: ["/api/payroll-summary"] });
  const { data: employees = [] } = useEmployees();

  const totalAnnual = rows.reduce((s, r) => s + r.totalMonthlyPayroll, 0);
  const totalHeadcount = rows.reduce((s, r) => s + r.headcount, 0);
  const avgPerEmployee = totalHeadcount > 0 ? totalAnnual / totalHeadcount : 0;
  const topDept = rows.length > 0 ? rows.reduce((a, b) => a.totalMonthlyPayroll > b.totalMonthlyPayroll ? a : b) : null;

  const maxPayroll = Math.max(...rows.map(r => r.totalMonthlyPayroll), 1);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Payroll Overview</h1>
        <p className="text-muted-foreground text-lg mt-1">Annual salary cost breakdown by department based on assigned job roles.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 bg-green-500/5 rounded-bl-[80px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Annual Cost</CardTitle>
            <div className="p-2 bg-green-500/10 text-green-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-32" /> : (
              <div className="text-2xl font-display font-bold text-foreground" data-testid="kpi-total-payroll">{fmt(totalAnnual)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-bl-[80px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Headcount</CardTitle>
            <div className="p-2 bg-primary/10 text-primary rounded-lg"><Users className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-display font-bold text-foreground" data-testid="kpi-headcount">{totalHeadcount}</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 bg-chart-2/5 rounded-bl-[80px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg per Employee</CardTitle>
            <div className="p-2 bg-chart-2/10 text-chart-2 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-28" /> : (
              <div className="text-2xl font-display font-bold text-foreground" data-testid="kpi-avg-salary">{fmt(avgPerEmployee)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-28 h-28 bg-chart-3/5 rounded-bl-[80px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Cost Dept</CardTitle>
            <div className="p-2 bg-chart-3/10 text-chart-3 rounded-lg"><Building2 className="w-5 h-5" /></div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-display font-bold text-foreground truncate" data-testid="kpi-top-dept">{topDept?.departmentName ?? "—"}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="font-display flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Department Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center text-muted-foreground">
              <AlertCircle className="w-10 h-10 opacity-30" />
              <p className="font-medium">No payroll data yet</p>
              <p className="text-sm">Add departments, job roles, and employees to see the payroll breakdown.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {rows
                .sort((a, b) => b.totalMonthlyPayroll - a.totalMonthlyPayroll)
                .map((row) => (
                  <div key={row.departmentName} className="p-5 hover:bg-secondary/20 transition-colors" data-testid={`row-payroll-${row.departmentName}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{row.departmentName}</div>
                          <div className="text-xs text-muted-foreground">{row.headcount} employee{row.headcount !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">{fmt(row.totalMonthlyPayroll)}</div>
                        <div className="text-xs text-muted-foreground">/ year</div>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(row.totalMonthlyPayroll / maxPayroll) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                      <span>{totalAnnual > 0 ? ((row.totalMonthlyPayroll / totalAnnual) * 100).toFixed(1) : 0}% of total</span>
                      <span>Monthly est: {fmt(row.totalMonthlyPayroll / 12)}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Employee Table */}
      {employees.length > 0 && (
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Employee Salary Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/50">
                    <th className="text-left p-4 font-semibold text-muted-foreground">Employee</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Department</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Role</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Annual Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors" data-testid={`row-emp-salary-${emp.id}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            {emp.name.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{emp.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{emp.departmentName ?? "—"}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="rounded-lg text-xs">{emp.roleTitle ?? "—"}</Badge>
                      </td>
                      <td className="p-4 text-right font-semibold text-foreground">
                        {emp.baseSalary ? fmt(Number(emp.baseSalary)) : "—"}
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
