import { useState, useCallback } from 'react'
import { workloadDistribution } from '@/services/aiService'
import WorkloadDistributionForm from '@/components/WorkloadDistributionForm'
import WorkloadDistributionResult from '@/components/WorkloadDistributionResult'
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import useDocumentMetadata from '@/hooks/useDocumentMetadata'

type DistributionResult = Awaited<ReturnType<typeof workloadDistribution>>

type Status = "idle" | "loading" | "success" | "error"

export default function WorkloadDistribution() {
  useDocumentMetadata({
    title: "Workload Distribution Balance",
    description: "Balance team tasks to avoid overloading developers and eliminate project bottlenecks."
  })

  const [status, setStatus] = useState<Status>("idle")
  const [result, setResult] = useState<DistributionResult | null>(null)
  const [teamCapacities, setTeamCapacities] = useState<Record<string, number>>({})
  const [error, setError] = useState('')

  const handleSubmit = useCallback(async (formData: {
    teamMembers: string
    taskList: string
  }) => {
    setStatus("loading")
    setError("")
    setResult(null)

    try {
      const team: Record<string, number> = {}
      formData.teamMembers
        .split('\n')
        .map((line) => line.split(':').map((item) => item.trim()))
        .filter((parts) => parts.length === 2)
        .forEach(([name, capacity]) => {
          team[name] = Number(capacity) || 1
        })

      setTeamCapacities(team)

      const tasks = formData.taskList
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((title) => ({ title, priority: 'Medium', estimated_hours: 4 }))

      if (Object.keys(team).length === 0) {
        throw new Error("Please specify at least one valid team member with format Name:Capacity (e.g. Alice:8)")
      }

      if (tasks.length === 0) {
        throw new Error("Please specify at least one task to distribute")
      }

      const response = await workloadDistribution({ team, tasks })
      setResult(response)
      setStatus("success")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate workload plan"
      )
      setStatus("error")
    }
  }, [])

  const handleReset = useCallback(() => {
    setStatus("idle")
    setResult(null)
    setTeamCapacities({})
    setError("")
  }, [])

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <Card className="relative overflow-hidden border-primary/20 bg-primary/5 shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 animate-pulse" />
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Calculating Workload Plan
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  AI is distributing tasks across capacities to optimize workloads and avoid bottlenecks...
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case "success":
        return result ? (
          <WorkloadDistributionResult
            result={result}
            teamCapacities={teamCapacities}
            onReset={handleReset}
          />
        ) : null

      default:
        return (
          <WorkloadDistributionForm
            onSubmit={handleSubmit}
            loading={false}
          />
        )
    }
  }

  return (
    <main className="container mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8 animate-in fade-in-50 duration-300">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground animate-in slide-in-from-top-2 duration-300">
          Workload Distribution
        </h1>
        <p className="mt-1 text-sm text-muted-foreground animate-in slide-in-from-top-2 duration-400">
          Balance team assignments and reduce bottlenecks using AI-assisted workload distribution.
        </p>
      </header>

      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-1">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {renderContent()}
      </div>
    </main>
  )
}
