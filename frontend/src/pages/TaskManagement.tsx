import { useEffect, useState } from 'react'
import { useProject } from '../context/ProjectContext'
import TaskCard from '../components/TaskCard/TaskCard'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import { createTask, fetchTasks } from '../services/taskService'
import type { Task } from '../types/Task'

const STATUS_COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
]

const getColumnColor = (statusId: string) => {
  switch (statusId) {
    case 'todo':
      return { borderColor: 'var(--status-blue)', backgroundColor: 'var(--status-blue-soft)' }
    case 'in_progress':
      return { borderColor: 'var(--status-orange)', backgroundColor: 'var(--status-orange-soft)' }
    case 'completed':
      return { borderColor: 'var(--status-green)', backgroundColor: 'var(--status-green-soft)' }
    default:
      return { borderColor: 'var(--status-gray)', backgroundColor: 'var(--status-gray-soft)' }
  }
}

export default function TaskManagement() {
  const { projects, loadProjects } = useProject()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [createError, setCreateError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'all'>('all')
  const [newTaskProjectId, setNewTaskProjectId] = useState<number | ''>('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('High')
  const [newTaskStatus, setNewTaskStatus] = useState('todo')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')

  useEffect(() => {
    loadProjects()
    loadTasks()
  }, [])

  useEffect(() => {
    if (projects.length > 0 && !newTaskProjectId) {
      setNewTaskProjectId(projects[0].id)
    }
  }, [projects, newTaskProjectId])

  const loadTasks = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await fetchTasks()
      setTasks(data)
    } catch (err) {
      setError((err as Error).message)
      console.error('Failed to load tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (taskId: number, newStatus: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    )
  }

  const filteredTasks =
    selectedProjectId === 'all'
      ? tasks
      : tasks.filter((task) => task.project_id === selectedProjectId)

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreateError('')
    setSuccessMessage('')

    if (!newTaskTitle.trim() || !newTaskProjectId) {
      setCreateError('Please provide a task title and select a project.')
      return
    }

    setIsCreating(true)

    try {
      const createdTask = await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        priority: newTaskPriority,
        status: newTaskStatus,
        due_date: newTaskDueDate || undefined,
        project_id: newTaskProjectId,
      })

      setTasks((prevTasks) => [createdTask, ...prevTasks])
      setSuccessMessage('Task added successfully.')
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskPriority('High')
      setNewTaskStatus('todo')
      setNewTaskDueDate('')
    } catch (err) {
      setCreateError((err as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <main className="page tasks-page">
      <h1>Task Management</h1>
      <p>Manage tasks with a Kanban board and add new work items directly.</p>

      <section className="ai-form-card">
        <form onSubmit={handleCreateTask}>
          <div className="form-grid">
            <label>
              Task Title
              <input
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Enter task title"
              />
            </label>

            <label>
              Project
              <select
                value={newTaskProjectId}
                onChange={(event) => setNewTaskProjectId(Number(event.target.value))}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                value={newTaskStatus}
                onChange={(event) => setNewTaskStatus(event.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={newTaskPriority}
                onChange={(event) => setNewTaskPriority(event.target.value)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>
          </div>

          <label>
            Due Date
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(event) => setNewTaskDueDate(event.target.value)}
            />
          </label>

          <label>
            Description
            <textarea
              value={newTaskDescription}
              onChange={(event) => setNewTaskDescription(event.target.value)}
              placeholder="Task details and acceptance criteria"
              rows={3}
            />
          </label>

          <button type="submit" disabled={isCreating || projects.length === 0}>
            {isCreating ? 'Adding task...' : 'Add Task'}
          </button>

          {createError && <div className="error-message">{createError}</div>}
          {successMessage && <div className="result-card">{successMessage}</div>}
        </form>
      </section>

      <div style={{ padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '24px' }}>
        <label htmlFor="project-filter" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '12px' }}>
          Filter by Project
        </label>
        <select
          id="project-filter"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          style={{ width: '100%', maxWidth: '300px' }}
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message" style={{ marginTop: '18px' }}>{error}</div>}

      {isLoading ? (
        <LoadingSpinner message="Loading tasks..." size="medium" />
      ) : (
        <section className="kanban-board" style={{ marginTop: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', paddingBottom: '32px' }}>
            {STATUS_COLUMNS.map((column) => {
              const columnTasks = getTasksByStatus(column.id)
              const columnColor = getColumnColor(column.id)

              return (
                <div
                  key={column.id}
                  style={{
                    minHeight: '360px',
                    padding: '18px',
                    borderRadius: '12px',
                    border: `2px solid ${columnColor.borderColor}`,
                    backgroundColor: columnColor.backgroundColor,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--heading)', margin: 0 }}>{column.label}</h2>
                    <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--status-gray-soft)',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                              }}
                    >
                      {columnTasks.length}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '14px' }}>
                    {columnTasks.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>No tasks in this column</p>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <div key={task.id} style={{ transition: 'all 0.3s ease' }}>
                          <TaskCard task={task} onStatusChange={handleStatusChange} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {!isLoading && filteredTasks.length === 0 && !error && (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', margin: 0 }}>No tasks found. Use the form above to add a new task.</p>
        </div>
      )}
    </main>
  )
}
