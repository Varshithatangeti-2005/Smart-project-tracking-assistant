import { useState } from 'react'
import type { Task } from '../../types/Task'
import { updateTask } from '../../services/taskService'

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: number, newStatus: string) => void
}

const STATUS_OPTIONS = ['todo', 'in_progress', 'completed']

const getPriorityStyle = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return { backgroundColor: 'var(--priority-high-soft)', color: 'var(--priority-high-text)', borderColor: 'var(--priority-high)' }
    case 'medium':
      return { backgroundColor: 'var(--priority-medium-soft)', color: 'var(--priority-medium-text)', borderColor: 'var(--priority-medium)' }
    case 'low':
      return { backgroundColor: 'var(--priority-low-soft)', color: 'var(--priority-low-text)', borderColor: 'var(--priority-low)' }
    default:
      return { backgroundColor: 'var(--priority-default-soft)', color: 'var(--priority-default-text)', borderColor: 'var(--priority-default)' }
  }
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateTask(task.id, { status: newStatus })
      onStatusChange?.(task.id, newStatus)
      setShowStatusMenu(false)
    } catch (error) {
      console.error('Failed to update task status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const priorityStyle = getPriorityStyle(task.priority)

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--surface-2)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--muted-shadow)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
        <h4
          style={{
            fontWeight: 600,
            color: 'var(--heading)',
            flex: 1,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.title}
        </h4>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={isUpdating}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              cursor: isUpdating ? 'default' : 'pointer',
              opacity: isUpdating ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            title="Change status"
          >
            <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showStatusMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                zIndex: 10,
                minWidth: '160px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
              }}
            >
              {STATUS_OPTIONS.map((status, index) => (
                  <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating || task.status === status}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    fontSize: '13px',
                    backgroundColor: task.status === status ? 'var(--accent-soft)' : isUpdating ? 'transparent' : 'transparent',
                    border: 'none',
                    borderBottom: index < STATUS_OPTIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    color: task.status === status ? 'var(--text-muted)' : 'var(--text-muted)',
                    cursor: isUpdating || task.status === status ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {task.description && (
          <p
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            border: '1px solid ' + priorityStyle.borderColor,
            ...priorityStyle,
          }}
        >
          {task.priority?.charAt(0).toUpperCase() + (task.priority?.slice(1) || 'edium')}
        </span>

        {task.due_date && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  )
}
