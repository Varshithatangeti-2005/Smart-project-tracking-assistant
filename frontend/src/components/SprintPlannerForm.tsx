import { useCallback, useState } from "react"

import { useProject } from "@/context/ProjectContext"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FormState = {
  projectId: string
  durationWeeks: number
  teamCapacity: number
  objectives: string
  taskList: string
}

interface SprintPlannerFormProps {
  onSubmit: (
    data: FormState
  ) => Promise<void> | void

  loading: boolean
}

const INITIAL_FORM: FormState = {
  projectId: "",
  durationWeeks: 2,
  teamCapacity: 20,
  objectives: "",
  taskList: "",
}

export default function SprintPlannerForm({
  onSubmit,
  loading,
}: SprintPlannerFormProps) {
  const { projects } = useProject()

  const [form, setForm] =
    useState<FormState>(INITIAL_FORM)

  const updateForm = <
    K extends keyof FormState,
  >(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!form.projectId) return

      onSubmit(form)
    },
    [form, onSubmit]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Generate Sprint Plan
        </CardTitle>

        <CardDescription>
          Provide project details,
          capacity, and tasks to
          generate an AI-powered
          sprint plan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                Project
              </Label>

              <Select
                value={form.projectId}
                onValueChange={(value) =>
                  updateForm(
                    "projectId",
                    value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>

                <SelectContent>
                  {projects.map(
                    (project) => (
                      <SelectItem
                        key={project.id}
                        value={String(
                          project.id
                        )}
                      >
                        {project.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground">
                Select the project to
                plan.
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Duration
                (Weeks)
              </Label>

              <Input
                type="number"
                min={1}
                max={12}
                value={
                  form.durationWeeks
                }
                onChange={(e) =>
                  updateForm(
                    "durationWeeks",
                    Number(
                      e.target.value
                    )
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                Usually 1–4 weeks.
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Weekly Capacity
              </Label>

              <Input
                type="number"
                min={1}
                value={
                  form.teamCapacity
                }
                onChange={(e) =>
                  updateForm(
                    "teamCapacity",
                    Number(
                      e.target.value
                    )
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                Hours or story
                points available.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Objectives
            </Label>

            <Textarea
              rows={3}
              value={
                form.objectives
              }
              onChange={(e) =>
                updateForm(
                  "objectives",
                  e.target.value
                )
              }
              placeholder="Sprint goals and expected outcomes..."
              className="resize-none"
            />

            <p className="text-xs text-muted-foreground">
              Describe what the
              sprint should achieve.
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Tasks
            </Label>

            <Textarea
              rows={6}
              value={form.taskList}
              onChange={(e) =>
                updateForm(
                  "taskList",
                  e.target.value
                )
              }
              placeholder={`Design authentication schema
Create login API
Build signup page
Write integration tests`}
            />

            <p className="text-xs text-muted-foreground">
              One task per line.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              !form.projectId
            }
          >
            {loading
              ? "Generating..."
              : "Generate Sprint Plan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}