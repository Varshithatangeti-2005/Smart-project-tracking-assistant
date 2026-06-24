import {
  useCallback,
  useEffect,
  useState,
} from "react"

import { Loader2 } from "lucide-react"

import { useProject } from "@/context/ProjectContext"

import {
  fetchSprints,
  updateSprint,
} from "@/services/sprintService"

import { sprintPlanning } from "@/services/aiService"

import type { Sprint } from "@/types/Sprint"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"

import SavedSprintCard from "@/components/SavedSprintCard"
import SprintPlanResult from "@/components/SprintPlanResult"

type PlanningResult =
  Awaited<
    ReturnType<typeof sprintPlanning>
  >

export default function SprintPlanning() {
  const { projects, loadProjects } =
    useProject()

  const [projectId, setProjectId] =
    useState("")

  const [objectives, setObjectives] =
    useState("")

  const [durationWeeks, setDurationWeeks] =
    useState(2)

  const [teamCapacity, setTeamCapacity] =
    useState(20)

  const [taskList, setTaskList] =
    useState("")

  const [result, setResult] =
    useState<PlanningResult | null>(
      null
    )

  const [sprints, setSprints] = useState<
    Sprint[]
  >([])

  const [error, setError] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [savingId, setSavingId] =
    useState<number | null>(null)

  const loadSprints = useCallback(
    async () => {
      try {
        setSprints(await fetchSprints())
      } catch (err) {
        console.error(err)
      }
    },
    []
  )

  useEffect(() => {
    loadProjects()
    loadSprints()
  }, [loadProjects, loadSprints])

  const selectedProject =
    projects.find(
      (p) =>
        p.id === Number(projectId)
    )

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setError("")
    setResult(null)
    setLoading(true)

    try {
      const tasks = taskList
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)

      const response =
        await sprintPlanning({
          project_name:
            selectedProject?.name ??
            "Untitled Project",
          tasks,
          duration_weeks:
            durationWeeks,
          team_capacity_per_week:
            teamCapacity,
          objectives:
            objectives || undefined,
        })

      setResult(response)
    } catch (err) {
      setError(
        (err as Error).message
      )
    } finally {
      setLoading(false)
    }
  }

  const completeSprint =
    async (id: number) => {
      setSavingId(id)

      try {
        const updated =
          await updateSprint(id, {
            end_date:
              new Date().toISOString(),
          })

        setSprints((prev) =>
          prev.map((s) =>
            s.id === id
              ? updated
              : s
          )
        )
      } finally {
        setSavingId(null)
      }
    }

  return (
    <main className="container mx-auto max-w-7xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Sprint Planning
        </h1>

        <p className="text-muted-foreground">
          Plan AI-powered sprint
          schedules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Generate Sprint Plan
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>
                  Project
                </Label>

                <Select
                  value={projectId}
                  onValueChange={
                    setProjectId
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>

                  <SelectContent>
                    {projects.map(
                      (
                        project
                      ) => (
                        <SelectItem
                          key={
                            project.id
                          }
                          value={String(
                            project.id
                          )}
                        >
                          {
                            project.name
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Duration
                </Label>

                <Input
                  type="number"
                  min={1}
                  value={
                    durationWeeks
                  }
                  onChange={(
                    e
                  ) =>
                    setDurationWeeks(
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                />
              </div>

              <div>
                <Label>
                  Capacity
                </Label>

                <Input
                  type="number"
                  min={1}
                  value={
                    teamCapacity
                  }
                  onChange={(
                    e
                  ) =>
                    setTeamCapacity(
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                />
              </div>
            </div>

            <div>
              <Label>
                Objectives
              </Label>

              <Textarea
                rows={3}
                value={
                  objectives
                }
                onChange={(
                  e
                ) =>
                  setObjectives(
                    e.target
                      .value
                  )
                }
              />
            </div>

            <div>
              <Label>
                Tasks
              </Label>

              <Textarea
                rows={6}
                value={
                  taskList
                }
                onChange={(
                  e
                ) =>
                  setTaskList(
                    e.target
                      .value
                  )
                }
              />
            </div>

            <Button
              className="w-full"
              disabled={
                loading ||
                !projectId
              }
            >
              Generate Sprint
              Plan
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card>
          <CardContent className="flex items-center gap-3 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />

            <span>
              Generating sprint
              plan...
            </span>
          </CardContent>
        </Card>
      )}

      {result && !loading && (
        <SprintPlanResult
          result={result}
        />
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Saved Sprints
        </h2>

        {sprints.map((sprint) => (
          <SavedSprintCard
            key={sprint.id}
            sprint={sprint}
            loading={
              savingId ===
              sprint.id
            }
            onComplete={
              completeSprint
            }
          />
        ))}
      </section>
    </main>
  )
}