import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WarningIcon, WarningCircleIcon, CheckCircleIcon, ArrowLeftIcon } from "@phosphor-icons/react"

interface RiskAnalysisResultProps {
  result: {
    risk_level: string
    top_risks: string[]
    mitigation_actions: string[]
    confidence?: string
  }
  metadata?: {
    projectName: string
    deadlineDays: number
    pendingTasks: number
    developers: number
    currentPhase: string
  }
  onReset: () => void
}

export default function RiskAnalysisResult({ result, metadata, onReset }: RiskAnalysisResultProps) {
  const riskLevelLower = result.risk_level.toLowerCase()

  // Dynamic theme selector based on risk level
  const getSeverityTheme = () => {
    if (riskLevelLower.includes("critical")) {
      return {
        badge: "bg-red-500/10 text-red-500 border-red-500/30 animate-pulse font-bold text-xs uppercase",
        gradient: "from-red-500/10 via-purple-500/5 to-transparent",
        border: "border-red-500/20",
        text: "text-red-500",
        bg: "bg-red-500/5",
        progressBg: "bg-red-500",
        icon: <WarningIcon className="size-8 text-red-500" />,
      }
    }
    if (riskLevelLower.includes("high")) {
      return {
        badge: "bg-orange-500/10 text-orange-500 border-orange-500/30 font-semibold text-xs uppercase",
        gradient: "from-orange-500/10 via-rose-500/5 to-transparent",
        border: "border-orange-500/20",
        text: "text-orange-500",
        bg: "bg-orange-500/5",
        progressBg: "bg-orange-500",
        icon: <WarningIcon className="size-8 text-orange-500" />,
      }
    }
    if (riskLevelLower.includes("medium") || riskLevelLower.includes("moderate")) {
      return {
        badge: "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold text-xs uppercase",
        gradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
        border: "border-amber-500/20",
        text: "text-amber-500",
        bg: "bg-amber-500/5",
        progressBg: "bg-amber-500",
        icon: <WarningCircleIcon className="size-8 text-amber-500" />,
      }
    }
    // Default to Low Risk theme
    return {
      badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-semibold text-xs uppercase",
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      border: "border-emerald-500/20",
      text: "text-emerald-500",
      bg: "bg-emerald-500/5",
      progressBg: "bg-emerald-500",
      icon: <CheckCircleIcon className="size-8 text-emerald-500" />,
    }
  }

  const theme = getSeverityTheme()

  // Convert confidence text (e.g. "85%" or "High") into numerical representation
  const getConfidenceValue = (conf?: string) => {
    if (!conf) return 0
    const match = conf.match(/\d+/)
    if (match) return Number(match[0])
    const lower = conf.toLowerCase()
    if (lower.includes("high")) return 90
    if (lower.includes("medium") || lower.includes("moderate")) return 65
    if (lower.includes("low")) return 35
    return 50
  }

  const confidenceVal = getConfidenceValue(result.confidence)

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header Summary Card */}
      <Card className={`relative overflow-hidden border-b-2 ${theme.border} shadow-lg`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} pointer-events-none`} />
        
        <CardHeader className="relative z-10 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                AI Risk Assessment
              </span>
              <CardTitle className="text-2xl font-black tracking-tight text-foreground">
                {metadata?.projectName || "Risk Summary Report"}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Severity:</span>
              <Badge variant="outline" className={theme.badge}>
                {result.risk_level}
              </Badge>
            </div>
          </div>

          {metadata && (
            <CardDescription className="text-xs text-muted-foreground mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-1 pt-2 border-t border-muted/10">
              <div>
                <span className="font-semibold text-foreground">Phase:</span> {metadata.currentPhase}
              </div>
              <div>
                <span className="font-semibold text-foreground">Deadline:</span> {metadata.deadlineDays} days
              </div>
              <div>
                <span className="font-semibold text-foreground">Pending Tasks:</span> {metadata.pendingTasks}
              </div>
              <div>
                <span className="font-semibold text-foreground">Developers:</span> {metadata.developers}
              </div>
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="relative z-10 pt-2 grid gap-6 md:grid-cols-3 items-center border-t border-muted/10">
          <div className="flex items-center gap-4 col-span-2">
            <div className={`p-3 rounded-full ${theme.bg}`}>
              {theme.icon}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">
                Current Projected Risk: <span className={theme.text}>{result.risk_level}</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The AI evaluated project variables, developers counts, and blockers to determine this threat level. Check mitigations below.
              </p>
            </div>
          </div>

          {result.confidence && (
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-muted/15 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground uppercase tracking-wider">Confidence</span>
                <span className={theme.text}>{result.confidence}</span>
              </div>
              <div className="relative w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${theme.progressBg} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${confidenceVal}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Row: Top Risks & Mitigation Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Risks */}
        <Card className="shadow border-muted/50">
          <CardHeader className="pb-3 border-b border-muted/20">
            <CardTitle className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <WarningIcon className={`size-4 ${theme.text}`} />
              Top Risks Identified
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {result.top_risks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No major risks identified.</p>
            ) : (
              <ul className="space-y-3">
                {result.top_risks.map((risk, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-md border ${theme.border} ${theme.bg} hover:-translate-y-[1px] transition-all duration-150`}
                  >
                    <WarningCircleIcon className={`size-4 mt-0.5 shrink-0 ${theme.text}`} />
                    <span className="text-xs/relaxed text-foreground font-medium">{risk}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Mitigation Actions */}
        <Card className="shadow border-muted/50">
          <CardHeader className="pb-3 border-b border-muted/20">
            <CardTitle className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckCircleIcon className="size-4 text-emerald-500" />
              Mitigation Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {result.mitigation_actions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No mitigation actions recommended.</p>
            ) : (
              <ul className="space-y-3">
                {result.mitigation_actions.map((action, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-md border border-emerald-500/10 bg-emerald-500/[0.02] hover:-translate-y-[1px] transition-all duration-150"
                  >
                    <CheckCircleIcon className="size-4 mt-0.5 shrink-0 text-emerald-500" />
                    <span className="text-xs/relaxed text-foreground font-medium">{action}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reset Action */}
      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeftIcon className="size-3" />
          Configure New Analysis
        </Button>
      </div>
    </div>
  )
}
