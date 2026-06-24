import { useCallback, useEffect, useState } from "react"
import { KanbanIcon, PlusIcon } from "@phosphor-icons/react"

import { useProject } from "../context/ProjectContext"
import type { Project } from "../types/Project"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function Projects() {
  const { projects, loadProjects, createProject } = useProject()

  const [isCreating, setIsCreating] = useState(false)

  const [form, setForm] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleCreate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!form.name.trim()) return

      try {
        setIsCreating(true)

        await createProject({
          name: form.name.trim(),
          description: form.description.trim(),
        })

        setForm({
          name: "",
          description: "",
        })
      } finally {
        setIsCreating(false)
      }
    },
    [form, createProject]
  )

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-3xl font-bold tracking-tight">
            Projects
          </h1>

          <p className="mt-2 text-muted-foreground">
            Create and manage your project workspaces.
          </p>
        </section>

        {/* Create Project */}
        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleCreate}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">
                  Project Name
                </Label>

                <Input
                  id="name"
                  placeholder="Smart Task Assistant"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description
                </Label>

                <Textarea
                  id="description"
                  placeholder="Describe the project..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                disabled={isCreating}
              >
                <PlusIcon weight="bold" />
                {isCreating
                  ? "Creating..."
                  : "Create Project"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Project List */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              All Projects
            </h2>

            <p className="text-sm text-muted-foreground">
              {projects.length} project
              {projects.length !== 1 && "s"}
            </p>
          </div>

          {projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <KanbanIcon
                  size={56}
                  weight="duotone"
                  className="mb-4 text-muted-foreground"
                />

                <h3 className="font-semibold">
                  No projects yet
                </h3>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Create your first project to start
                  managing tasks, risks, and sprint
                  planning.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project: Project) => (
                <Card
                  key={project.id}
                  className="transition-all hover:shadow-md"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <KanbanIcon
                        size={20}
                        className="text-primary"
                        weight="duotone"
                      />
                      {project.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="line-clamp-4 text-sm text-muted-foreground">
                      {project.description ||
                        "No description provided."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}