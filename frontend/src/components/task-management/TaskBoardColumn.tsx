import TaskCard from "@/components/TaskCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task } from "@/types/Task"

type TaskBoardColumnProps = {
  id: string
  label: string
  className: string
  tasks: Task[]
  onStatusChange: (taskId: number, status: string) => void
}

export default function TaskBoardColumn({
  id,
  label,
  className,
  tasks,
  onStatusChange,
}: TaskBoardColumnProps) {
  return (
    <Card key={id} className={className}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-lg">{label}</CardTitle>

        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs">
          {tasks.length}
        </span>
      </CardHeader>

      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No tasks</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
          ))
        )}
      </CardContent>
    </Card>
  )
}
