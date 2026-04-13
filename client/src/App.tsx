import { Switch, Route } from "wouter";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";

import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Attendance from "@/pages/attendance";
import Performance from "@/pages/performance";
import Departments from "@/pages/departments";
import Leaves from "@/pages/leaves";
import Payroll from "@/pages/payroll";
import Login from "@/pages/login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/employees" component={Employees}/>
      <Route path="/attendance" component={Attendance}/>
      <Route path="/performance" component={Performance}/>
      <Route path="/departments" component={Departments}/>
      <Route path="/leaves" component={Leaves}/>
      <Route path="/payroll" component={Payroll}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { data: user, isLoading } = useQuery<{ id: number; username: string; role: string } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <TooltipProvider>
      <SidebarProvider style={style}>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AppSidebar user={user} />
          <div className="flex flex-col flex-1 w-full overflow-hidden">
            <header className="h-16 flex items-center px-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              <SidebarTrigger className="hover-elevate active-elevate-2 text-muted-foreground hover:text-foreground" data-testid="button-sidebar-toggle" />
            </header>
            <main className="flex-1 overflow-y-auto bg-background/50">
              <Router />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedApp />
    </QueryClientProvider>
  );
}

export default App;
