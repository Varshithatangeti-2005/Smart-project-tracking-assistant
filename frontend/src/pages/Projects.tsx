import { useEffect, useState } from 'react'
import { useProject } from '../context/ProjectContext'
import type { Project } from '../types/Project'

export default function Projects() {
  const { projects, loadProjects, createProject } = useProject()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createProject({ name, description })
    setName('')
    setDescription('')
  }

  return (
    <main className="page projects-page">
      <h1>Projects</h1>
      <form onSubmit={handleCreate} className="project-form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <button type="submit">Create Project</button>
      </form>
      <section className="projects-list">
        {projects.length === 0 ? (
          <p>No projects available yet.</p>
        ) : (
          <ul>
            {projects.map((project: Project) => (
              <li key={project.id}>
                <h2>{project.name}</h2>
                <p>{project.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
