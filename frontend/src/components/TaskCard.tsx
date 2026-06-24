import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { Task } from '../types/Task'

type TaskCardProps = {
  task: Task
  onStatusChange?: (taskId: number, status: string) => void
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  return (
    <Card className="border-muted/60 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="font-medium leading-none text-foreground">{task.title}</h3>
          {task.description ? (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-1">Priority: {task.priority}</span>
          <span className="rounded-full bg-muted px-2 py-1">Status: {task.status}</span>
        </div>

        {onStatusChange ? (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Update status</Label>
            <Select value={task.status} onValueChange={(value) => onStatusChange(task.id, value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
