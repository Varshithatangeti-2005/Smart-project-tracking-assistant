import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ChartBarIcon } from "@phosphor-icons/react"

export interface WorkloadDistributionFormProps {
  onSubmit: (data: {
    teamMembers: string
    taskList: string
  }) => Promise<void> | void
  loading: boolean
}

export default function WorkloadDistributionForm({
  onSubmit,
  loading,
}: WorkloadDistributionFormProps) {
  const [teamMembers, setTeamMembers] = useState("Alice:8\nBob:10\nClara:6")
  const [taskList, setTaskList] = useState(
    "Design homepage\nImplement login flow\nReview QA findings\nWrite integration tests\nSetup CI/CD pipeline"
  )

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
                <span className="text-[10px] text-muted-foreground">One task per line</span>
              </div>
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
