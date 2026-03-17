import { Link, useLocation } from "wouter";
import { 
  Users, 
  LayoutDashboard, 
  CalendarCheck, 
  Building2,
  TrendingUp,
  CalendarOff,
  Briefcase,
  DollarSign
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
} from "@/components/ui/sidebar";

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

export function AppSidebar() {
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
    </Sidebar>
  );
}
