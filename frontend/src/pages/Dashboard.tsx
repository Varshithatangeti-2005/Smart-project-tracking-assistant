import { useEffect, useState } from 'react'
import { useProject } from '../context/ProjectContext'
import { fetchTasks } from '../services/taskService'
import { fetchSprints } from '../services/sprintService'
import type { Task } from '../types/Task'
import type { Sprint } from '../types/Sprint'

const isSprintActive = (sprint: Sprint) => {
  if (!sprint.start_date && !sprint.end_date) {
    return true
  }

  const now = new Date()
  const start = sprint.start_date ? new Date(sprint.start_date) : null
  const end = sprint.end_date ? new Date(sprint.end_date) : null

  if (start && end) {
    return now >= start && now <= end
  }

  if (start && !end) {
    return now >= start
  }

  if (!start && end) {
    return now <= end
  }

  return false
}

export default function Dashboard() {
  const { projects, loadProjects } = useProject()
  const [tasks, setTasks] = useState<Task[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])

  useEffect(() => {
    loadProjects()
    loadTasks()
    loadSprints()
  }, [loadProjects])

  const loadTasks = async () => {
    try {
      const data = await fetchTasks()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks', error)
    }
  }

  const loadSprints = async () => {
    try {
      const data = await fetchSprints()
      setSprints(data)
    } catch (error) {
      console.error('Failed to load sprints', error)
    }
  }

  const activeSprintCount = sprints.filter(isSprintActive).length
  const openTaskCount = tasks.filter((task) => task.status !== 'completed').length

  return (
    <main className="page dashboard-page">
      <h1>Dashboard</h1>
      <section className="overview-cards">
        <div className="overview-card">
          <h2>Projects</h2>
          <p>{projects.length}</p>
        </div>
        <div className="overview-card">
          <h2>Active Sprints</h2>
          <p>{activeSprintCount}</p>
        </div>
        <div className="overview-card">
          <h2>Open Tasks</h2>
          <p>{openTaskCount}</p>
        </div>
      </section>
      <section className="projects-list">
        <h2>Recent Projects</h2>
        {projects.length === 0 ? (
          <p>No projects yet. Create a project to get started.</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
