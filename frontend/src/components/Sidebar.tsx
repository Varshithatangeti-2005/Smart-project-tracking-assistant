import type { ComponentType } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  WarningIcon,
  ChartBarIcon,
  ClipboardTextIcon,
  KanbanIcon,
  GaugeIcon,
  SquaresFourIcon,
  ChecksIcon,
  UserIcon,
  WarningCircleIcon
} from '@phosphor-icons/react'

import {
	Sidebar as AppSidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"

type NavItem = {
	title: string
	href: string
	icon: ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
	{ title: "Dashboard", href: "/", icon: SquaresFourIcon },
	{ title: "Projects", href: "/projects", icon: KanbanIcon },
	{ title: "Sprint Planning", href: "/sprint-planning", icon: ChecksIcon },
	{ title: "Task Estimation", href: "/task-estimation", icon: GaugeIcon },
	{ title: "Task Management", href: "/tasks", icon: ClipboardTextIcon },
	{ title: "Risk Analysis", href: "/risks", icon: WarningIcon },
	{ title: "Workload Distribution", href: "/workload", icon: ChartBarIcon },
]

export default function Sidebar() {
	const location = useLocation()
  const {user} = useAuth()

	return (
		<AppSidebar variant="sidebar" collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild size="lg" isActive={location.pathname === "/"}>
							<Link to="/">
								<SquaresFourIcon className="size-4" />
								<span>Smart PM</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarSeparator />

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Workspace</SidebarGroupLabel>
					<SidebarGroupContent>
						{user ? <SidebarMenu>
              
							{navItems.map((item) => {
								const isActive =
									item.href === "/"
										? location.pathname === "/"
										: location.pathname.startsWith(item.href)

								return (
									(<SidebarMenuItem key={item.href}>
										<SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
											<Link to={item.href}>
												<item.icon className="size-4" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>)
								)
							})}
						</SidebarMenu> : (
              <div className="grid gap-2 h-full py-auto">
                <WarningCircleIcon className="mx-auto size-6 text-muted-foreground" />
                <p className="text-muted-foreground">Login first to access workspace</p>
              </div>
            )}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarSeparator />

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={location.pathname.startsWith("/profile")} tooltip="Profile">
							<Link to="/profile">
								<UserIcon className="size-4" />
								<span>Profile</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</AppSidebar>
	)
}