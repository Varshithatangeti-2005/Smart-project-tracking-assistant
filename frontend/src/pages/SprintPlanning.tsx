import { FormEvent, useEffect, useState } from 'react'
import { useProject } from '../context/ProjectContext'
import SprintCard from '../components/SprintCard/SprintCard'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import { fetchSprints, updateSprint } from '../services/sprintService'
import { sprintPlanning } from '../services/aiService'
import type { Sprint } from '../types/Sprint'

export default function SprintPlanning() {
  const { projects, loadProjects } = useProject()
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
  const [objectives, setObjectives] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(2)
  const [teamCapacity, setTeamCapacity] = useState(20)
  const [taskList, setTaskList] = useState('')
  const [result, setResult] = useState<null | { sprint_outlines: Array<{ name: string; tasks: string[]; start_date: string; end_date: string; duration_days: number }>; recommended_sprint_count: number; summary?: string }>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [isSavingSprintId, setIsSavingSprintId] = useState<number | null>(null)
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    loadProjects()
    loadSprints()
  }, [loadProjects])

  const loadSprints = async () => {
    try {
      const data = await fetchSprints()
      setSprints(data)
    } catch (err) {
      console.error('Failed to load sprints', err)
    }
  }

  const getSprintStatus = (sprint: Sprint) => {
    if (!sprint.start_date && !sprint.end_date) {
      return 'Draft'
    }

    const now = new Date()
    const endDate = sprint.end_date ? new Date(sprint.end_date) : null
    const startDate = sprint.start_date ? new Date(sprint.start_date) : null

    if (endDate && endDate < now) {
      return 'Completed'
    }

    if (startDate && startDate > now) {
      return 'Upcoming'
    }

    return 'Active'
  }

  const handleCompleteSprint = async (sprintId: number) => {
    setUpdateError('')
    setIsSavingSprintId(sprintId)

    try {
      const now = new Date().toISOString()
      const updatedSprint = await updateSprint(sprintId, { end_date: now })
      setSprints((prev) => prev.map((sprint) => (sprint.id === sprintId ? updatedSprint : sprint)))
    } catch (err) {
      setUpdateError((err as Error).message)
    } finally {
      setIsSavingSprintId(null)
    }
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)
    setIsLoading(true)

    try {
      const tasks = taskList
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      const projectName = selectedProject?.name || 'Untitled Project'

      const response = await sprintPlanning({
        project_name: projectName,
        tasks,
        duration_weeks: durationWeeks,
        team_capacity_per_week: teamCapacity,
        objectives: objectives || undefined,
      })

      setResult(response)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page sprint-page">
      <h1>Sprint Planning</h1>
      <p>Review project backlog, plan sprint goals, and assign tasks.</p>

      <section className="ai-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label htmlFor="project-select">
              Project Name
              <select
                id="project-select"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value ? Number(event.target.value) : '')}
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="duration">
              Duration (weeks)
              <input
                id="duration"
                type="number"
                value={durationWeeks}
                onChange={(event) => setDurationWeeks(Number(event.target.value))}
                min={1}
              />
            </label>

            <label htmlFor="capacity">
              Team capacity per week
              <input
                id="capacity"
                type="number"
                value={teamCapacity}
                onChange={(event) => setTeamCapacity(Number(event.target.value))}
                min={1}
              />
            </label>
          </div>

          <label htmlFor="objectives">
            Objectives
            <textarea
              id="objectives"
              value={objectives}
              onChange={(event) => setObjectives(event.target.value)}
              placeholder="Sprint objectives"
              rows={3}
            />
          </label>

          <label htmlFor="tasks">
            Tasks (one per line)
            <textarea
              id="tasks"
              value={taskList}
              onChange={(event) => setTaskList(event.target.value)}
              placeholder="Task 1\nTask 2\nTask 3"
              rows={4}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading || !selectedProjectId}
            style={{
              width: '100%',
              marginTop: '20px',
              opacity: isLoading || !selectedProjectId ? 0.6 : 1,
              cursor: isLoading || !selectedProjectId ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Generating...' : 'Generate Sprint Plan'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {isLoading && <LoadingSpinner message="AI Assistant is calculating sprint parameters..." size="medium" />}

        {result && !isLoading && (
          <div className="result-card">
            <h2>Recommended Sprint Plan</h2>
            <p>Recommended sprints: {result.recommended_sprint_count}</p>
            {result.summary && <p>{result.summary}</p>}
            <div style={{ marginTop: '20px' }}>
              {result.sprint_outlines.map((outline, index) => (
                <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface-2)' }}>
                  <h4 style={{ margin: '0 0 8px' }}>{outline.name}</h4>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                    <strong>Duration:</strong> {outline.duration_days} days
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                    <strong>Period:</strong> {outline.start_date} to {outline.end_date}
                  </p>
                  <div style={{ marginTop: '8px' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Tasks:</strong>
                    <ul style={{ margin: '6px 0 0', paddingLeft: '20px', fontSize: '0.9rem' }}>
                      {outline.tasks.map((task, taskIndex) => (
                        <li key={taskIndex}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="sprint-list">
        {projects.length === 0 ? (
          <p>No projects available to plan yet.</p>
        ) : (
          projects.map((project) => (
            <article key={project.id} className="project-sprint-preview">
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <SprintCard sprint={{ id: project.id, project_id: project.id, name: `${project.name} sprint`, start_date: '', end_date: '' }} />
            </article>
          ))
        )}
      </section>

      <section className="sprint-list" style={{ marginTop: '32px' }}>
        <h2>Saved Sprints</h2>
        {updateError && <div className="error-message">{updateError}</div>}
        {sprints.length === 0 ? (
          <p>No saved sprints found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '18px' }}>
            {sprints.map((sprint) => {
              const status = getSprintStatus(sprint)
              const isCompleted = status === 'Completed'

              return (
                <article key={sprint.id} className="project-sprint-preview" style={{ border: '1px solid var(--border)', padding: '18px', borderRadius: '20px', background: 'var(--surface-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px' }}>{sprint.name}</h3>
                      <p style={{ margin: 0 }}>Start: {sprint.start_date || 'TBD'}</p>
                      <p style={{ margin: '6px 0 0' }}>End: {sprint.end_date || 'TBD'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, color: isCompleted ? 'var(--text)' : 'var(--text)', background: isCompleted ? 'var(--success)' : 'var(--surface-3)' }}>
                        {status}
                      </span>
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => handleCompleteSprint(sprint.id)}
                          disabled={isSavingSprintId === sprint.id}
                          style={{
                            marginTop: '12px',
                            width: '100%',
                            background: 'var(--gradient-accent)',
                            color: 'var(--text)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px 14px',
                            cursor: isSavingSprintId === sprint.id ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isSavingSprintId === sprint.id ? 'Completing…' : 'Mark Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
