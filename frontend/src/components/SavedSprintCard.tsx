import type { Sprint } from "@/types/Sprint"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Props {
  sprint: Sprint
  loading: boolean
  onComplete: (id: number) => void
}

function getStatus(sprint: Sprint) {
  if (!sprint.start_date && !sprint.end_date)
    return "Draft"

  const now = Date.now()

  const start = sprint.start_date
    ? new Date(sprint.start_date).getTime()
    : null

  const end = sprint.end_date
    ? new Date(sprint.end_date).getTime()
    : null

  if (end && end < now) return "Completed"
  if (start && start > now) return "Upcoming"

  return "Active"
}

export default function SavedSprintCard({
  sprint,
  loading,
  onComplete,
}: Props) {
  const status = getStatus(sprint)

  const badgeClass = {
    Active:
      "bg-primary text-primary-foreground",
    Completed:
      "bg-green-500 text-white",
    Upcoming:
      "bg-blue-500 text-white",
    Draft:
      "bg-muted text-muted-foreground",
  }[status]

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>{sprint.name}</CardTitle>

          <p className="text-sm text-muted-foreground">
            {sprint.start_date || "TBD"} →{" "}
            {sprint.end_date || "TBD"}
          </p>
        </div>

        <Badge className={badgeClass}>
          {status}
        </Badge>
      </CardHeader>

      {status !== "Completed" && (
        <CardContent>
          <Button
            onClick={() => onComplete(sprint.id)}
            disabled={loading}
          >
            {loading
              ? "Completing..."
              : "Mark Completed"}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}