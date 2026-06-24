import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface SprintPlanningResult {
  sprint_outlines: Array<{
    name: string
    tasks: string[]
    start_date: string
    end_date: string
    duration_days: number
  }>
  recommended_sprint_count: number
  summary?: string
}

export default function SprintPlanResult({
  result,
}: {
  result: SprintPlanningResult
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Recommended Sprint Plan
        </CardTitle>

        <CardDescription>
          Recommended Sprints:{" "}
          {result.recommended_sprint_count}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {result.summary && (
          <p className="text-muted-foreground">
            {result.summary}
          </p>
        )}

        {result.sprint_outlines.map(
          (outline, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>
                  {outline.name}
                </CardTitle>

                <CardDescription>
                  {outline.start_date} →{" "}
                  {outline.end_date}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Duration:{" "}
                  {outline.duration_days} days
                </p>

                <ul className="list-disc space-y-1 pl-5">
                  {outline.tasks.map(
                    (task, taskIndex) => (
                      <li key={taskIndex}>
                        {task}
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          )
        )}
      </CardContent>
    </Card>
  )
}