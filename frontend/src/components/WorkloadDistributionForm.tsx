import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
import { ChartBarIcon } from "@phosphor-icons/react"

export interface WorkloadDistributionFormProps {
  onSubmit: (data: {
    teamMembers: string
    taskList: string
  }) => Promise<void> | void
  loading: boolean
  sprintOptions?: Array<{ name: string; tasks: string[] }>
  projects?: Project[]
  selectedProjectId?: string
  onProjectChange?: (projectId: string) => void
  projectTasks?: Task[]
}

export default function WorkloadDistributionForm({
  onSubmit,
  loading,
  sprintOptions = [],
  projects = [],
  selectedProjectId = "",
  onProjectChange,
  projectTasks = [],
}: WorkloadDistributionFormProps) {
  const [teamMembers, setTeamMembers] = useState("Alice:8\nBob:10\nClara:6")
  const [taskList, setTaskList] = useState(
    "Design homepage\nImplement login flow\nReview QA findings\nWrite integration tests\nSetup CI/CD pipeline"
  )
  const [selectedSprint, setSelectedSprint] = useState("")

  useEffect(() => {
    if (!sprintOptions.length) return
    if (!selectedSprint && sprintOptions[0]) {
      setSelectedSprint(sprintOptions[0].name)
    }
  }, [sprintOptions, selectedSprint])

  useEffect(() => {
    if (!selectedSprint) return
    const matchedSprint = sprintOptions.find((sprint) => sprint.name === selectedSprint)
    if (!matchedSprint) return
    if (!taskList.trim()) {
      setTaskList(matchedSprint.tasks.join("\n"))
    }
  }, [selectedSprint, sprintOptions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamMembers.trim() || !taskList.trim()) return
    onSubmit({
      teamMembers,
      taskList,
    })
  }

  return (
    <Card className="shadow-lg border-muted/50 bg-card">
      <CardHeader className="bg-muted/10 pb-4 border-b border-muted/20">
        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
          <ChartBarIcon className="size-5 text-primary" />
          Configure Workload Distribution
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Provide your team capacities and list of tasks to generate an optimized distribution workload plan.
        </CardDescription>
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
              <Label htmlFor="workload-sprint-select" className="font-semibold text-foreground">
                Generated Sprint
              </Label>
              <Select value={selectedSprint} onValueChange={setSelectedSprint}>
                <SelectTrigger id="workload-sprint-select">
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
                Use a sprint from the planning step to preload its task list.
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="team-input" className="font-semibold text-foreground">
                  Team Members & Weekly Capacity
                </Label>
                <span className="text-[10px] text-muted-foreground">Format: Name:Hours</span>
              </div>
              <Textarea
                id="team-input"
                rows={6}
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                placeholder={`Alice:8\nBob:10\nClara:6`}
                className="font-mono text-xs resize-none"
                required
              />
              <p className="text-[10px] text-muted-foreground/80 leading-normal">
                Specify available weekly hours or points per developer, one per line.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="tasks-input" className="font-semibold text-foreground">
                  Tasks List
                </Label>
                {projectTasks.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">Project tasks available</span>
                )}
                <span className="text-[10px] text-muted-foreground">One task per line</span>
              </div>
              {projectTasks.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {projectTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setTaskList((current) => current ? `${current}\n${task.title}` : task.title)}
                      className="rounded-full border border-primary/20 bg-background px-2 py-1 text-[11px] text-foreground hover:bg-primary/10"
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              )}
              <Textarea
                id="tasks-input"
                rows={6}
                value={taskList}
                onChange={(e) => setTaskList(e.target.value)}
                placeholder={`Task 1\nTask 2\nTask 3`}
                className="text-xs resize-none"
                required
              />
              <p className="text-[10px] text-muted-foreground/80 leading-normal">
                Enter tasks to allocate. The AI model assigns them based on team capacity limitations.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full font-semibold shadow hover:shadow-md transition-all duration-200"
            disabled={loading || !teamMembers.trim() || !taskList.trim()}
          >
            {loading ? "Distributing Workload..." : "Generate Workload Plan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
