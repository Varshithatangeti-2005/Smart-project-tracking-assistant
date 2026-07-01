import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function SprintPlanningLoading() {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-md overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 animate-pulse" />
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-base">
            Analyzing Tasks & Capacity
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            AI is analyzing your project goals, team capability, and task list to design the optimal sprint schedule. This may take a few moments...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
