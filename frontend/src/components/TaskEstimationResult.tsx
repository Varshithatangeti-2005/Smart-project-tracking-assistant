import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, AlertCircle, Sparkles } from "lucide-react"

export interface TaskEstimationResultProps {
  result: {
    min_hours: number
    max_hours: number
    difficulty: string
    confidence?: string
    reasoning?: string
    notes?: string
  }
}

export default function TaskEstimationResult({ result }: TaskEstimationResultProps) {
  // Helper to color difficulty badge
  const getDifficultyColor = (diff: string) => {
    const d = diff.toLowerCase()
    if (d.includes("low") || d.includes("easy")) return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
    if (d.includes("high") || d.includes("hard") || d.includes("complex")) return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  }

  // Helper to color confidence badge
  const getConfidenceColor = (conf?: string) => {
    if (!conf) return ""
    const c = conf.toLowerCase()
    if (c.includes("high")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    if (c.includes("low")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  }

  return (
    <Card className="shadow-lg border-primary/10 overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
            AI Estimation Report
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Calculated range based on standard metrics and complexities.
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Estimated Hours block */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-muted/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Estimated Duration
              </p>
              <p className="text-2xl font-black text-foreground">
                {result.min_hours} – {result.max_hours}{" "}
                <span className="text-sm font-normal text-muted-foreground">Hours</span>
              </p>
            </div>
          </div>

          {/* Badges block */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-muted/30 border border-muted/50 justify-start md:justify-around">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Difficulty Level
              </span>
              <Badge variant="outline" className={`px-3 py-1 font-semibold border ${getDifficultyColor(result.difficulty)}`}>
                {result.difficulty}
              </Badge>
            </div>

            {result.confidence && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Confidence Score
                </span>
                <Badge variant="outline" className={`px-3 py-1 font-semibold border ${getConfidenceColor(result.confidence)}`}>
                  {result.confidence}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Reasoning section */}
        {result.reasoning && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Reasoning Analysis
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border border-muted/30 whitespace-pre-wrap">
              {result.reasoning}
            </div>
          </div>
        )}

        {/* Notes section */}
        {result.notes && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Developer Notes & Recommendations
            </h3>
            <div className="text-sm text-muted-foreground leading-relaxed bg-amber-500/[0.03] text-amber-900 dark:text-amber-200/90 p-4 rounded-lg border border-amber-500/10 whitespace-pre-wrap">
              {result.notes}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
