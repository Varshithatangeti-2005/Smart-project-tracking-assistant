import { useCallback, useEffect, useMemo, useState } from "react"

import { useProject } from "@/context/ProjectContext"

import { createTask, fetchTasks } from "@/services/taskService"

import type { Task } from "@/types/Task"

import TaskBoardColumn from "@/components/task-management/TaskBoardColumn"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Loader2 } from "lucide-react"

const STATUS_COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    className:
      "border-blue-500/30 bg-blue-500/5",
  },
  {
    id: "in_progress",
    label: "In Progress",
    className:
      "border-amber-500/30 bg-amber-500/5",
  },
  {
    id: "completed",
    label: "Completed",
    className:
      "border-green-500/30 bg-green-500/5",
  },
]

export default function TaskManagement() {
  const { projects, loadProjects } =
    useProject()

  const [tasks, setTasks] = useState<
    Task[]
  >([])

  const [isLoading, setIsLoading] =
    useState(false)

  const [isCreating, setIsCreating] =
    useState(false)

  const [error, setError] = useState("")
  const [createError, setCreateError] =
    useState("")

  const [success, setSuccess] =
    useState("")

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState<string>("all")

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "High",
    status: "todo",
    dueDate: "",
    projectId: "",
  })

  const updateForm = (
    key: keyof typeof form,
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))

  const loadTasks = useCallback(
    async () => {
      setIsLoading(true)

      try {
        const data =
          await fetchTasks()

        setTasks(data)
      } catch (err) {
        setError(
          (err as Error).message
        )
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    loadProjects()
    loadTasks()
  }, [loadProjects, loadTasks])

  useEffect(() => {
    if (
      projects.length > 0 &&
      !form.projectId
    ) {
      updateForm(
        "projectId",
        String(projects[0].id)
      )
    }
  }, [projects, form.projectId])

  const filteredTasks = useMemo(
    () =>
      selectedProjectId === "all"
        ? tasks
        : tasks.filter(
            (task) =>
              task.project_id ===
              Number(
                selectedProjectId
              )
          ),
    [tasks, selectedProjectId]
  )

  const groupedTasks = useMemo(
    () => ({
      todo: filteredTasks.filter(
        (t) => t.status === "todo"
      ),
      in_progress:
        filteredTasks.filter(
          (t) =>
            t.status ===
            "in_progress"
        ),
      completed:
        filteredTasks.filter(
          (t) =>
            t.status ===
            "completed"
        ),
    }),
    [filteredTasks]
  )

  const handleStatusChange = (
    taskId: number,
    status: string
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status }
          : task
      )
    )
  }

  const handleCreateTask = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setCreateError("")
    setSuccess("")

    if (
      !form.title.trim() ||
      !form.projectId
    ) {
      setCreateError(
        "Task title and project are required."
      )
      return
    }

    setIsCreating(true)

    try {
      const task =
        await createTask({
          title:
            form.title.trim(),
          description:
            form.description.trim(),
          priority:
            form.priority,
          status: form.status,
          due_date:
            form.dueDate ||
            undefined,
          project_id: Number(
            form.projectId
          ),
        })

      setTasks((prev) => [
        task,
        ...prev,
      ])

      setSuccess(
        "Task created successfully."
      )

      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        dueDate: "",
        priority: "High",
        status: "todo",
      }))
    } catch (err) {
      setCreateError(
        (err as Error).message
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <main className="container mx-auto max-w-7xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Task Management
        </h1>

        <p className="text-muted-foreground">
          Manage tasks using a
          Kanban board.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Create Task
          </CardTitle>

          <CardDescription>
            Add a new work item
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={
              handleCreateTask
            }
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>
                  Title
                </Label>

                <Input
                  value={
                    form.title
                  }
                  onChange={(e) =>
                    updateForm(
                      "title",
                      e.target
                        .value
                    )
                  }
                />
              </div>

              <div>
                <Label>
                  Project
                </Label>

                <Select
                  value={
                    form.projectId
                  }
                  onValueChange={(
                    value
                  ) =>
                    updateForm(
                      "projectId",
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {projects.map(
                      (
                        project
                      ) => (
                        <SelectItem
                          key={
                            project.id
                          }
                          value={String(
                            project.id
                          )}
                        >
                          {
                            project.name
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Status
                </Label>

                <Select
                  value={
                    form.status
                  }
                  onValueChange={(
                    value
                  ) =>
                    updateForm(
                      "status",
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="todo">
                      To Do
                    </SelectItem>

                    <SelectItem value="in_progress">
                      In Progress
                    </SelectItem>

                    <SelectItem value="completed">
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Priority
                </Label>

                <Select
                  value={
                    form.priority
                  }
                  onValueChange={(
                    value
                  ) =>
                    updateForm(
                      "priority",
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="High">
                      High
                    </SelectItem>

                    <SelectItem value="Medium">
                      Medium
                    </SelectItem>

                    <SelectItem value="Low">
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>
                Due Date
              </Label>

              <Input
                type="date"
                value={
                  form.dueDate
                }
                onChange={(e) =>
                  updateForm(
                    "dueDate",
                    e.target
                      .value
                  )
                }
              />
            </div>

            <div>
              <Label>
                Description
              </Label>

              <Textarea
                rows={4}
                value={
                  form.description
                }
                onChange={(e) =>
                  updateForm(
                    "description",
                    e.target
                      .value
                  )
                }
              />
            </div>

            {createError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {
                    createError
                  }
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={
                isCreating
              }
            >
              {isCreating
                ? "Creating..."
                : "Create Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Label>
            Filter by Project
          </Label>

          <Select
            value={
              selectedProjectId
            }
            onValueChange={
              setSelectedProjectId
            }
          >
            <SelectTrigger className="mt-2 max-w-sm">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Projects
              </SelectItem>

              {projects.map(
                (project) => (
                  <SelectItem
                    key={
                      project.id
                    }
                    value={String(
                      project.id
                    )}
                  >
                    {
                      project.name
                    }
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading tasks...
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          {STATUS_COLUMNS.map((column) => {
            const tasks = groupedTasks[column.id as keyof typeof groupedTasks]

            return (
              <TaskBoardColumn
                key={column.id}
                id={column.id}
                label={column.label}
                className={column.className}
                tasks={tasks}
                onStatusChange={handleStatusChange}
              />
            )
          })}
        </section>
      )}
    </main>
  )
}