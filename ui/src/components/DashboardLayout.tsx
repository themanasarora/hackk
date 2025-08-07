import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  Users,
  Settings,
  Shield,
  AlertTriangle,
  Brain,
  Search,
  Bell,
  User,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navigationItems = [
  {
    name: "Dashboard",
    icon: BarChart3,
    href: "dashboard",
    active: true
  },
  {
    name: "Entity Management", 
    icon: Users,
    href: "entities",
    active: false
  },
  {
    name: "Risk Rules Engine",
    icon: Shield,
    href: "rules",
    active: false
  },
  {
    name: "Configuration",
    icon: Settings,
    href: "config",
    active: false
  },
  {
    name: "Alerts & Threats",
    icon: AlertTriangle,
    href: "alerts",
    active: false
  },
 
];

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <div className="min-h-screen ">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar transform transition-transform duration-200 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">PredictaShield</h1>
              <p className="text-xs text-muted-foreground">Admin Console</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant={activeTab === item.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-left",
                  activeTab === item.href 
                    ? "bg-primary text-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => onTabChange?.(item.href)}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.name}</span>
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              <div>
                <h2 className="text-xl font-semibold">Security Dashboard</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-online rounded-full"></div>
                  <span className="text-sm text-muted-foreground">System Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search entities, alerts..."
                  className="w-64 pl-9 bg-background/50"
                />
              </div> */}

             
              {/* Notifications with dropdown */}
<div className="relative">
  <Button
    variant="ghost"
    size="sm"
    className="relative"
    onClick={() => setNotificationOpen(!notificationOpen)}
  >
    <Bell className="w-6 h-6" />
    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-semibold rounded-full px-1">
      3
    </span>
  </Button>

  {notificationOpen && (
    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg border rounded-lg z-50">
      <ul className="text-sm text-gray-700 max-h-60 overflow-y-auto">
        <li className="px-4 py-2 border-b hover:bg-gray-100">
          New login from unknown device
        </li>
        <li className="px-4 py-2 border-b hover:bg-gray-100">
          Scheduled maintenance at 2 AM
        </li>
        <li className="px-4 py-2 hover:bg-gray-100">
          Backup completed successfully
        </li>
      </ul>
    </div>
  )}
</div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-status-online rounded-full"></div>
                <span className="text-sm hidden md:inline">Online</span>
              </div>

              {/* User menu */}
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">AD</span>
                </div>
                <span className="text-sm hidden md:inline">Admin</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}