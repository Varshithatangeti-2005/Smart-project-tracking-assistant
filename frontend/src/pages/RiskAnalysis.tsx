import { useState, useCallback } from 'react'
import { riskAnalysis } from '@/services/aiService'
import RiskAnalysisForm from '@/components/RiskAnalysisForm'
import RiskAnalysisResult from '@/components/RiskAnalysisResult'
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import useDocumentMetadata from '@/hooks/useDocumentMetadata'

type AnalysisResult = Awaited<ReturnType<typeof riskAnalysis>>

type Status = "idle" | "loading" | "success" | "error"

interface AnalysisMetadata {
  projectName: string
  deadlineDays: number
  pendingTasks: number
  developers: number
  currentPhase: string
}

export default function RiskAnalysis() {
  useDocumentMetadata({
    title: "Project Risk Analysis",
    description: "Evaluate deadlines, developers, and technical blockers to forecast project risks and mitigations."
  })

  const [status, setStatus] = useState<Status>("idle")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [metadata, setMetadata] = useState<AnalysisMetadata | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = useCallback(async (formData: {
    projectId: number
    projectName: string
    deadlineDays: number
    pendingTasks: number
    developers: number
    blockers: string
    technicalDebt: string
    currentPhase: string
  }) => {
    setStatus("loading")
    setError("")
    setResult(null)
    setMetadata({
      projectName: formData.projectName,
      deadlineDays: formData.deadlineDays,
      pendingTasks: formData.pendingTasks,
      developers: formData.developers,
      currentPhase: formData.currentPhase
    })

    try {
      const blockersList = formData.blockers
        ? formData.blockers.split("\n").map((b) => b.trim()).filter(Boolean)
        : undefined

      const response = await riskAnalysis({
        project_name: formData.projectName,
        deadline_days: formData.deadlineDays,
        pending_tasks: formData.pendingTasks,
        developers: formData.developers,
        blockers: blockersList,
        technical_debt: formData.technicalDebt || undefined,
        current_phase: formData.currentPhase
      })

      setResult(response)
      setStatus("success")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate risk analysis"
      )
      setStatus("error")
    }
  }, [])

  const handleReset = useCallback(() => {
    setStatus("idle")
    setResult(null)
    setMetadata(null)
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
                  Running Risk Analysis
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  AI is evaluating project constraints, blockers, and technical debt parameters...
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case "success":
        return result ? (
          <RiskAnalysisResult
            result={result}
            metadata={metadata || undefined}
            onReset={handleReset}
          />
        ) : null

      default:
        return (
          <RiskAnalysisForm
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
          Project Risk Analysis
        </h1>
        <p className="mt-1 text-sm text-muted-foreground animate-in slide-in-from-top-2 duration-400">
          Identify threat levels, key project risks, and recommend mitigations dynamically using machine intelligence.
        </p>
      </header>

      <div className="space-y-4">
        {status === "error" && (
          <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-1">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {renderContent()}
      </div>
    </main>
  )
}
