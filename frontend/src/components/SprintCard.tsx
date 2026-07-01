import type { Sprint } from '../types/Sprint'

export default function SprintCard({ sprint }: { sprint: Sprint }) {
  return (
    <div className="sprint-card">
      <h3>{sprint.name}</h3>
      <p>Start: {sprint.start_date || 'TBD'}</p>
      <p>End: {sprint.end_date || 'TBD'}</p>
    </div>
  )
}
