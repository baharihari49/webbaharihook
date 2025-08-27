"use client"

import * as React from "react"
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import {
  Webhook,
  Home,
  Plus,
  Send,
  Globe,
  LogOut,
  User,
  HelpCircle,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const data = {
    user: {
      name: session?.user?.name || "User",
      email: session?.user?.email || "",
      avatar: "/avatars/default.jpg",
    },
    teams: [
      {
        name: "Webbaharihook",
        logo: Webhook,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        isActive: pathname === "/dashboard",
        items: [],
      },
      {
        title: "Webhooks",
        url: "/dashboard",
        icon: Webhook,
        isActive: pathname?.startsWith("/dashboard/webhook") || false,
        items: [
          {
            title: "All Webhooks",
            url: "/dashboard",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Create Webhook",
        url: "/dashboard?action=create",
        icon: Plus,
      },
      {
        name: "Test Webhook",
        url: "/dashboard?action=test",
        icon: Send,
      },
      {
        name: "Global Status",
        url: "/dashboard?view=status",
        icon: Globe,
      },
    ],
    quickActions: [
      {
        title: "Profile Settings",
        action: () => {
          // For now, just show user info - could be expanded to a profile page
          alert(`Logged in as: ${session?.user?.name || 'User'}\nEmail: ${session?.user?.email || 'No email'}`)
        },
        icon: User,
      },
      {
        title: "Help & Support",
        action: () => {
          window.open('https://docs.webbaharihook.dev', '_blank')
        },
        icon: HelpCircle,
      },
      {
        title: "Sign Out",
        action: () => {
          signOut({ callbackUrl: '/' })
        },
        icon: LogOut,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <QuickActions actions={data.quickActions} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

// Quick Actions Component
function QuickActions({ actions }: { actions: Array<{ title: string; action: () => void; icon: React.ComponentType<{ className?: string }> }> }) {
  return (
    <div className="px-3 py-2">
      <div className="text-xs font-semibold text-sidebar-foreground/70 mb-2 px-2">
        QUICK ACTIONS
      </div>
      <div className="space-y-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="w-full flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <action.icon className="h-4 w-4" />
            <span className="truncate">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}