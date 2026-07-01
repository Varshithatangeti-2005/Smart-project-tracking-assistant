import type { Sprint } from "@/types/Sprint"
import SavedSprintCard from "@/components/SavedSprintCard"
import { Card, CardContent } from "@/components/ui/card"

export interface SavedSprintsListProps {
  sprints: Sprint[]
  savingId: number | null
  onComplete: (id: number) => Promise<void> | void
}

export default function SavedSprintsList({
  sprints,
  savingId,
  onComplete,
}: SavedSprintsListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-muted/30">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Saved Sprints
        </h2>
        <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
          {sprints.length} {sprints.length === 1 ? "Sprint" : "Sprints"}
        </span>
      </div>

      {sprints.length === 0 ? (
        <Card className="border-dashed bg-muted/5 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              No saved sprints found.
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-sm">
              Generate a new sprint plan using the form above to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint) => (
            <SavedSprintCard
              key={sprint.id}
              sprint={sprint}
              loading={savingId === sprint.id}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
