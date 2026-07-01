import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
import type { Project } from "@/types/Project"
import type { Task } from "@/types/Task"

export interface TaskEstimationFormProps {
  onSubmit: (data: {
    taskName: string
    description: string
    priority: string
    deadlineDays: number
    experience: string
    factors: string
  }) => Promise<void> | void
  loading: boolean
  sprintOptions?: Array<{ name: string; tasks: string[] }>
  projects?: Project[]
  selectedProjectId?: string
  onProjectChange?: (projectId: string) => void
  projectTasks?: Task[]
}

export default function TaskEstimationForm({
  onSubmit,
  loading,
  sprintOptions = [],
  projects = [],
  selectedProjectId = "",
  onProjectChange,
  projectTasks = [],
}: TaskEstimationFormProps) {
  const [taskName, setTaskName] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("Normal")
  const [deadlineDays, setDeadlineDays] = useState(7)
  const [experience, setExperience] = useState("Intermediate")
  const [factors, setFactors] = useState("")
  const [selectedSprint, setSelectedSprint] = useState("")

  useEffect(() => {
    if (!sprintOptions.length) return
    if (!selectedSprint && sprintOptions[0]) {
      setSelectedSprint(sprintOptions[0].name)
    }
  }, [sprintOptions, selectedSprint])

  const selectedSprintTasks = sprintOptions.find((sprint) => sprint.name === selectedSprint)?.tasks ?? []

  const handleSprintTaskChange = (task: string) => {
    setTaskName(task)
    setDescription(`Sprint: ${selectedSprint}\nTask: ${task}\nDescription: ${task} work to be completed within ${selectedSprint}.`)
    setFactors(`Dependency: finalise related ${selectedSprint} story\nRisks: scope change or external approval delays`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      taskName,
      description,
      priority,
      deadlineDays,
      experience,
      factors,
    })
  }

  return (
    <Card className="sticky top-4 shadow-lg border-muted/50">
      <CardHeader className="bg-muted/10 pb-4 border-b border-muted/20">
        <CardTitle className="text-xl font-bold tracking-tight">
          Configure Estimation Parameters
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Specify task descriptions, priority levels, experience coefficients, and complexity factors to compute hours.
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project-select" className="font-semibold text-foreground">
              Project
            </Label>
            <Select value={selectedProjectId} onValueChange={onProjectChange}>
              <SelectTrigger id="project-select">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projectTasks.length > 0 && (
              <p className="text-xs text-muted-foreground/80">
                Showing {projectTasks.length} task(s) from the selected project.
              </p>
            )}
          </div>

          {sprintOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="sprint-select" className="font-semibold text-foreground">
                Generated Sprint
              </Label>
              <Select value={selectedSprint} onValueChange={setSelectedSprint}>
                <SelectTrigger id="sprint-select">
                  <SelectValue placeholder="Choose a generated sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprintOptions.map((sprint) => (
                    <SelectItem key={sprint.name} value={sprint.name}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground/80">
                Pick a sprint from the planning step to reuse its task breakdown.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="task-name" className="font-semibold text-foreground">
              Task Name
            </Label>
            {selectedSprintTasks.length > 0 && (
              <div className="rounded-md border border-muted/40 bg-muted/10 p-2">
                <p className="mb-2 text-[11px] font-medium text-muted-foreground">Sprint tasks</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSprintTasks.map((task) => (
                    <button
                      key={task}
                      type="button"
                      onClick={() => handleSprintTaskChange(task)}
                      className="rounded-full border border-primary/20 bg-background px-2 py-1 text-[11px] text-foreground hover:bg-primary/10"
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Input
              id="task-name"
              placeholder="e.g. Implement OAuth2 Authentication"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc" className="font-semibold text-foreground">
              Description
            </Label>
            <Textarea
              id="task-desc"
              rows={3}
              placeholder="e.g. Set up OAuth2 flow using Keycloak/Auth0, integrate login page UI, and secure API router endpoints."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="priority-select" className="font-semibold text-foreground">
                Priority
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority-select">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline-input" className="font-semibold text-foreground">
                Deadline (Days)
              </Label>
              <Input
                id="deadline-input"
                type="number"
                min={1}
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience-select" className="font-semibold text-foreground">
                Assigned Team Experience
              </Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger id="experience-select">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="factors-input" className="font-semibold text-foreground">
              Complexity Factors (One per line)
            </Label>
            <Textarea
              id="factors-input"
              rows={4}
              placeholder={`e.g.\nThird-party authentication server setup\nCustom redirection callback handling\nEncryption requirement for tokens`}
              value={factors}
              onChange={(e) => setFactors(e.target.value)}
            />
            <p className="text-xs text-muted-foreground/80">
              List any specific challenges or risks associated with this task. Write each factor on a new line.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full font-semibold shadow hover:shadow-md transition-all duration-200"
            disabled={loading || !taskName.trim()}
          >
            Estimate Effort
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
