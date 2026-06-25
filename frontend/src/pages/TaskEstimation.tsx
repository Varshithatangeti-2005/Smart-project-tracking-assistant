import { useState, useCallback } from "react"
import { taskEstimation } from "@/services/aiService"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import TaskEstimationForm from "@/components/TaskEstimationForm"
import TaskEstimationResult from "@/components/TaskEstimationResult"
import useDocumentMetadata from "@/hooks/useDocumentMetadata"

type EstimationResult = Awaited<ReturnType<typeof taskEstimation>>

type Status = "idle" | "loading" | "success" | "error"

interface FormData {
  taskName: string
  description: string
  priority: string
  deadlineDays: number
  experience: string
  factors: string
}

export default function TaskEstimation() {
  useDocumentMetadata({
    title: "Task Effort Estimation",
    description: "Calculate estimated development effort ranges based on complexity and experience factors."
  })

  const [status, setStatus] = useState<Status>("idle")
  const [result, setResult] = useState<EstimationResult | null>(null)
  const [error, setError] = useState("")

  const handleEstimateSubmit = useCallback(async (formData: FormData) => {
    setStatus("loading")
    setError("")
    setResult(null)

    try {
      const complexityFactors = formData.factors
        .split("\n")
        .map((factor) => factor.trim())
        .filter(Boolean)

      const response = await taskEstimation({
        task_name: formData.taskName.trim() || "New Task",
        task_description: formData.description,
        priority: formData.priority,
        deadline_days: formData.deadlineDays,
        team_experience_level: formData.experience,
        complexity_factors: complexityFactors,
      })

      setResult(response)
      setStatus("success")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate estimation"
      )
      setStatus("error")
    }
  }, [])

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <Card className="relative overflow-hidden border-primary/20 bg-primary/5 shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="space-y-1">
                <p className="text-base font-semibold">
                  Calculating Estimates
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  AI is reviewing task complexity, constraints, and effort
                  estimates...
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case "success":
        return result ? <TaskEstimationResult result={result} /> : null

      default:
        return (
          <Card className="flex h-[300px] items-center justify-center border-dashed border-muted-foreground/20 bg-muted/5">
            <CardContent className="space-y-2 py-10 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No Estimation Report Generated Yet
              </p>
              <p className="mx-auto max-w-xs text-xs text-muted-foreground/60">
                Configure the parameters and click "Estimate Effort" to generate
                a report.
              </p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <main className="container mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Task Effort Estimation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estimate project tasks using AI and generate effort ranges based on
          complexity and team factors.
        </p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="lg:flex-[5]">
          <TaskEstimationForm
            onSubmit={handleEstimateSubmit}
            loading={status === "loading"}
          />
        </div>

        <div className="space-y-4 lg:flex-[7]">
          {status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderContent()}
        </div>
      </div>
    </main>
  )
}