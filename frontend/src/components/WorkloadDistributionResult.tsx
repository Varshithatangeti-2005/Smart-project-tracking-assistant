import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserIcon, ArrowLeftIcon } from "@phosphor-icons/react"

interface Assignment {
  task: string
  assignee: string
  estimated_hours: number
}

export interface WorkloadDistributionResultProps {
  result: {
    assignments: Assignment[]
    balance_score?: number
  }
  teamCapacities: Record<string, number>
  onReset: () => void
}

export default function WorkloadDistributionResult({
  result,
  teamCapacities,
  onReset,
}: WorkloadDistributionResultProps) {
  // Collect all developers from inputs and assignments
  const allAssignees = Array.from(
    new Set([
      ...Object.keys(teamCapacities),
      ...result.assignments.map((a) => a.assignee),
    ])
  ).sort()

  const balanceScoreLower = result.balance_score || 0

  const getBalanceBadgeStyle = () => {
    if (balanceScoreLower >= 80) {
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-bold uppercase"
    }
    if (balanceScoreLower >= 50) {
      return "bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold uppercase"
    }
    return "bg-red-500/10 text-red-500 border-red-500/30 font-bold uppercase"
  }

  const getLoadTheme = (percent: number) => {
    if (percent > 100) {
      return {
        text: "text-red-500",
        progressBg: "bg-red-500",
        badge: "bg-red-500/10 text-red-500 border-red-500/20",
        bg: "bg-red-500/5",
        border: "border-red-500/20",
        status: "Overloaded",
      }
    }
    if (percent >= 80) {
      return {
        text: "text-emerald-500",
        progressBg: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        bg: "bg-emerald-500/5",
        border: "border-emerald-500/20",
        status: "Optimal Load",
      }
    }
    return {
      text: "text-indigo-500",
      progressBg: "bg-indigo-500",
      badge: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      bg: "bg-indigo-500/5",
      border: "border-indigo-500/20",
      status: "Available Capacity",
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Overview Card */}
      <Card className="shadow-lg border-muted/50">
        <CardHeader className="pb-4 bg-muted/10 border-b border-muted/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                AI Allocation Report
              </span>
              <CardTitle className="text-2xl font-black tracking-tight text-foreground">
                Workload Distribution Summary
              </CardTitle>
            </div>
            
            {result.balance_score !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Balance Score:</span>
                <Badge variant="outline" className={getBalanceBadgeStyle()}>
                  {result.balance_score}/100
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            The AI engine distributed tasks across resource capabilities to reduce bottleneck overheads. Review the individual status breakdowns below.
          </p>
        </CardContent>
      </Card>

      {/* Grid of Team Member Load Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allAssignees.map((assignee) => {
          const tasks = result.assignments.filter((a) => a.assignee === assignee)
          const totalHours = tasks.reduce((sum, t) => sum + t.estimated_hours, 0)
          const capacity = teamCapacities[assignee] || 8
          const loadPercent = capacity > 0 ? Math.round((totalHours / capacity) * 100) : 0
          const loadTheme = getLoadTheme(loadPercent)

          return (
            <Card key={assignee} className={`shadow border-t-4 ${loadTheme.border} flex flex-col justify-between`}>
              <CardHeader className="pb-3 border-b border-muted/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="size-4 text-muted-foreground" />
                    <span className="font-bold text-foreground text-sm">{assignee}</span>
                  </div>
                  <Badge variant="outline" className={`${loadTheme.badge} text-[10px]`}>
                    {loadTheme.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-muted-foreground uppercase">Load Capacity</span>
                    <span className={loadTheme.text}>{totalHours}h / {capacity}h ({loadPercent}%)</span>
                  </div>
                  <div className="relative w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${loadTheme.progressBg} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(loadPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-2 tracking-wider">
                  Assigned Tasks ({tasks.length})
                </span>
                {tasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-6 text-center border border-dashed border-muted-foreground/10 rounded-sm">
                    <p className="text-[10px] text-muted-foreground">No tasks assigned.</p>
                  </div>
                ) : (
                  <ul className="space-y-2 flex-1">
                    {tasks.map((t, idx) => (
                      <li
                        key={idx}
                        className="flex items-start justify-between gap-3 p-2 rounded-sm border border-muted/20 bg-muted/5 hover:bg-muted/10 transition-colors"
                      >
                        <span className="text-[10px] text-foreground font-medium leading-normal break-all">
                          {t.task}
                        </span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {t.estimated_hours}h
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Reset Action */}
      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeftIcon className="size-3" />
          Configure New Distribution
        </Button>
      </div>
    </div>
  )
}
