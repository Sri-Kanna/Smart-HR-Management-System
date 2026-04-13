import { Link, useLocation } from "wouter";
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  Building2,
  TrendingUp,
  CalendarOff,
  Briefcase,
  DollarSign,
  LogOut,
  UserCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const mainNav = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
];

const peopleNav = [
  { title: "Employees", href: "/employees", icon: Users },
  { title: "Leave Management", href: "/leaves", icon: CalendarOff },
];

const operationsNav = [
  { title: "Attendance", href: "/attendance", icon: CalendarCheck },
  { title: "Performance", href: "/performance", icon: TrendingUp },
  { title: "Payroll", href: "/payroll", icon: DollarSign },
];

const settingsNav = [
  { title: "Departments & Roles", href: "/departments", icon: Briefcase },
];

function NavGroup({ label, items }: { label: string; items: typeof mainNav }) {
  const [location] = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const isActive = location === item.href;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                    data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

interface AppSidebarProps {
  user: { id: number; username: string; role: string };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { toast } = useToast();

  async function handleLogout() {
    try {
      await apiRequest("POST", "/api/auth/logout");
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.setQueryData(["/api/auth/me"], null);
    } catch {
      toast({ title: "Error", description: "Failed to log out", variant: "destructive" });
    }
  }

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-tight">SmartHR</span>
            <span className="text-xs text-muted-foreground font-medium">Management System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 space-y-1">
        <NavGroup label="Overview" items={mainNav} />
        <SidebarSeparator className="my-1" />
        <NavGroup label="People" items={peopleNav} />
        <SidebarSeparator className="my-1" />
        <NavGroup label="Operations" items={operationsNav} />
        <SidebarSeparator className="my-1" />
        <NavGroup label="Configuration" items={settingsNav} />
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
            <UserCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold truncate" data-testid="text-username">{user.username}</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-sm font-medium"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
