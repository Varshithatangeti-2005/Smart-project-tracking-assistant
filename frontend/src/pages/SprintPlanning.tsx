import { useCallback, useEffect, useState } from "react"
import { useProject } from "@/context/ProjectContext"
import { fetchSprints, updateSprint } from "@/services/sprintService"
import { sprintPlanning } from "@/services/aiService"
import type { Sprint } from "@/types/Sprint"
import useDocumentMetadata from "@/hooks/useDocumentMetadata"

import { Alert, AlertDescription } from "@/components/ui/alert"
import SprintPlannerForm from "@/components/SprintPlannerForm"
import SavedSprintsList from "@/components/SavedSprintsList"
import SprintPlanningLoading from "@/components/SprintPlanningLoading"
import SprintPlanResult from "@/components/SprintPlanResult"

type PlanningResult = Awaited<ReturnType<typeof sprintPlanning>>

export default function SprintPlanning() {
  useDocumentMetadata({
    title: "Sprint Planning",
    description: "Plan milestones, define capacity, and generate outlined sprints with AI."
  })

  const { projects, loadProjects } = useProject()
  const [result, setResult] = useState<PlanningResult | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)

  const loadSprints = useCallback(async () => {
    try {
      setSprints(await fetchSprints())
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadProjects()
    loadSprints()
  }, [loadProjects, loadSprints])

  const handlePlanningSubmit = async (formData: {
    projectId: string
    durationWeeks: number
    teamCapacity: number
    objectives: string
    taskList: string
  }) => {
    setError("")
    setResult(null)
    setLoading(true)

    const selectedProject = projects.find(
      (p) => p.id === Number(formData.projectId)
    )

    try {
      const tasks = formData.taskList
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)

      const response = await sprintPlanning({
        project_name: selectedProject?.name ?? "Untitled Project",
        tasks,
        duration_weeks: formData.durationWeeks,
        team_capacity_per_week: formData.teamCapacity,
        objectives: formData.objectives || undefined,
      })

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "generated-sprints",
          JSON.stringify(response.sprint_outlines)
        )
      }

      setResult(response)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const completeSprint = async (id: number) => {
    setSavingId(id)

    try {
      const updated = await updateSprint(id, {
        end_date: new Date().toISOString(),
      })

      setSprints((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <main className="container mx-auto max-w-7xl space-y-8 py-8 px-4 md:px-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Sprint Planning
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate optimized, AI-powered sprint schedules and manage active sprints.
        </p>
      </div>

      <SprintPlannerForm onSubmit={handlePlanningSubmit} loading={loading} />

      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && <SprintPlanningLoading />}

      {result && !loading && <SprintPlanResult result={result} />}

      <SavedSprintsList
        sprints={sprints}
        savingId={savingId}
        onComplete={completeSprint}
      />
    </main>
  )
}