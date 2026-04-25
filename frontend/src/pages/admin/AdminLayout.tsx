import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Flag, LayoutList, Users, LogOut } from 'lucide-react';
import { clearStoredAuthToken } from '@/lib/auth';
import { NavLink } from "@/components/NavLink";
import lekhakLogo from "@/assets/lekhak-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Reports', url: '/admin/reports', icon: Flag },
  { title: 'Categories', url: '/admin/categories', icon: LayoutList },
  { title: 'Users', url: '/admin/users', icon: Users },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const handleLogout = () => {
    clearStoredAuthToken();
    navigate('/admin/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="px-3 py-4">
        <NavLink to="/admin/dashboard" className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <img
            src={lekhakLogo}
            alt="Lekhak logo"
            className="h-9 w-9 rounded-xl object-cover shadow-glow shrink-0"
          />
          {!collapsed && (
            <span className="text-lg font-bold text-gradient-primary">Admin</span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-accent/60 rounded-lg"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout">
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors">
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>Logout</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen bg-background overflow-hidden w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}