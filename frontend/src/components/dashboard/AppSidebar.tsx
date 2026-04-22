import { LayoutDashboard, BookOpen, Bookmark, LifeBuoy } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Blogs", url: "/my-blogs", icon: BookOpen },
  { title: "Saved", url: "/saved", icon: Bookmark },
  { title: "Help Centre", url: "/help", icon: LifeBuoy },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="px-3 py-4">
        <NavLink to="/" className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <img
            src={lekhakLogo}
            alt="Lekhak logo"
            className="h-9 w-9 rounded-xl object-cover shadow-glow shrink-0"
          />
          {!collapsed && (
            <span className="text-lg font-bold text-gradient-primary">Lekhak</span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
