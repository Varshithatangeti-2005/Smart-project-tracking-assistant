import React, { useState, useEffect } from "react"
import { useProject } from "@/context/ProjectContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
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
import { WarningIcon } from "@phosphor-icons/react"

export interface RiskAnalysisFormProps {
  onSubmit: (data: {
    projectId: number
    projectName: string
    deadlineDays: number
    pendingTasks: number
    developers: number
    blockers: string
    technicalDebt: string
    currentPhase: string
  }) => Promise<void> | void
  loading: boolean
}

export default function RiskAnalysisForm({ onSubmit, loading }: RiskAnalysisFormProps) {
  const { projects, loadProjects } = useProject()
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [deadlineDays, setDeadlineDays] = useState(14)
  const [pendingTasks, setPendingTasks] = useState(10)
  const [developers, setDevelopers] = useState(3)
  const [blockers, setBlockers] = useState("")
  const [technicalDebt, setTechnicalDebt] = useState("")
  const [currentPhase, setCurrentPhase] = useState("Planning")

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const selectedProject = projects.find((p) => String(p.id) === selectedProjectId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) return
    onSubmit({
      projectId: Number(selectedProjectId),
      projectName: selectedProject?.name || "Project X",
      deadlineDays,
      pendingTasks,
      developers,
      blockers,
      technicalDebt,
      currentPhase,
    })
  }

  return (
    <Card className="shadow-lg border-muted/50 bg-card">
      <CardHeader className="bg-muted/10 pb-4 border-b border-muted/20">
        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
          <WarningIcon className="size-5 text-primary" />
          Configure Analysis Parameters
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Select a project and specify constraints, developers count, and blocker items to identify risks.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project-select" className="font-semibold text-foreground">
                Project Name
              </Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="project-select" className="w-full">
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase-select" className="font-semibold text-foreground">
                Current Phase
              </Label>
              <Select value={currentPhase} onValueChange={setCurrentPhase}>
                <SelectTrigger id="phase-select" className="w-full">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                  <SelectItem value="Deployment">Deployment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="font-semibold text-foreground">
                Deadline (days)
              </Label>
              <Input
                id="deadline"
                type="number"
                min={1}
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pending-tasks" className="font-semibold text-foreground">
                Pending Tasks
              </Label>
              <Input
                id="pending-tasks"
                type="number"
                min={0}
                value={pendingTasks}
                onChange={(e) => setPendingTasks(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="developers" className="font-semibold text-foreground">
                Developers
              </Label>
              <Input
                id="developers"
                type="number"
                min={1}
                value={developers}
                onChange={(e) => setDevelopers(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blockers" className="font-semibold text-foreground">
              Blockers (one per line)
            </Label>
            <Textarea
              id="blockers"
              rows={3}
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="e.g. Blocked by API integration delay&#10;Waiting for assets from client"
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tech-debt" className="font-semibold text-foreground">
              Technical Debt Notes
            </Label>
            <Textarea
              id="tech-debt"
              rows={3}
              value={technicalDebt}
              onChange={(e) => setTechnicalDebt(e.target.value)}
              placeholder="e.g. Legacy codebase, missing test coverage on auth endpoints"
              className="resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-semibold shadow hover:shadow-md transition-all duration-200"
            disabled={loading || !selectedProjectId}
          >
            {loading ? "Analyzing..." : "Analyze Risk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
