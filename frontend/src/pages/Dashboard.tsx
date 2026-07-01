import { useState, useEffect, useCallback } from "react"
import { useProject } from "../context/ProjectContext"
import { useAuth } from "@/context/AuthContext"
import useDocumentMetadata from "@/hooks/useDocumentMetadata"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  KanbanIcon,
  CheckSquareIcon,
  GaugeIcon,
} from "@phosphor-icons/react"

// Import these from your actual locations
import { fetchTasks } from "@/services/taskService"
import { fetchSprints } from "@/services/sprintService"
import type { Task } from "@/types/Task"
import type { Sprint } from "@/types/Sprint"

function isSprintActive(sprint: Sprint): boolean {
  if (!sprint.start_date || !sprint.end_date) return false

  const start = new Date(sprint.start_date)
  const end = new Date(sprint.end_date)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false

  const now = new Date()
  return now >= start && now <= end
}

export default function Dashboard() {
  useDocumentMetadata({
    title: "Dashboard",
    description: "Overview of your smart project management workspace, active projects, tasks, and sprint progress."
  })

  const { projects, loadProjects } = useProject()
  const { user } = useAuth()

  const [tasks, setTasks] = useState<Task[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks()
      setTasks(data)
    } catch (error) {
      console.error("Failed to load tasks", error)
    }
  }, [])

  const loadSprints = useCallback(async () => {
    try {
      const data = await fetchSprints()
      setSprints(data)
    } catch (error) {
      console.error("Failed to load sprints", error)
    }
  }, [])

  useEffect(() => {
    loadProjects()
    loadTasks()
    loadSprints()
  }, [loadProjects, loadTasks, loadSprints])

  const activeSprintCount = sprints.filter(isSprintActive).length

  const openTaskCount = tasks.filter(
    (task) => task.status !== "completed"
  ).length

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const greeting = getGreeting()
  const displayName = user?.full_name ?? user?.email ?? "there"

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight">
            {user ? `Hey! ${greeting} ${displayName}` : "Dashboard"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {user
              ? "Welcome back to your smart project tracking workspace."
              : "Monitor projects, sprints, and task progress."}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Projects
              </CardTitle>
              <KanbanIcon
                size={22}
                className="text-primary"
                weight="duotone"
              />
            </CardHeader>

            <CardContent>
              <div className="text-4xl font-bold">
                {projects.length}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Total projects in workspace
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Sprints
              </CardTitle>
              <GaugeIcon
                size={22}
                className="text-primary"
                weight="duotone"
              />
            </CardHeader>

            <CardContent>
              <div className="text-4xl font-bold">
                {activeSprintCount}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Currently running sprints
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Open Tasks
              </CardTitle>
              <CheckSquareIcon
                size={22}
                className="text-primary"
                weight="duotone"
              />
            </CardHeader>

            <CardContent>
              <div className="text-4xl font-bold">
                {openTaskCount}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Pending tasks across projects
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Recent Projects section unchanged */}
      </div>
    </main>
  )
}