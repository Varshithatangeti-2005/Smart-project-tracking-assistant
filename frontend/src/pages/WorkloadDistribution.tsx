import { useState } from 'react'
import { workloadDistribution } from '../services/aiService'

export default function WorkloadDistribution() {
  const [teamMembers, setTeamMembers] = useState('Alice:8\nBob:10\nClara:6')
  const [taskList, setTaskList] = useState('Design homepage\nImplement login flow\nReview QA findings')
  const [result, setResult] = useState<null | { assignments: { task: string; assignee: string; estimated_hours: number }[]; balance_score?: string }>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)

    try {
      const team: Record<string, number> = {}
      teamMembers
        .split('\n')
        .map((line) => line.split(':').map((item) => item.trim()))
        .filter((parts) => parts.length === 2)
        .forEach(([name, capacity]) => {
          team[name] = Number(capacity) || 1
        })

      const tasks = taskList
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((title) => ({ title, priority: 'Medium', estimated_hours: 4 }))

      const response = await workloadDistribution({ team, tasks })
      setResult(response)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <main className="page workload-page">
      <h1>Workload Distribution</h1>
      <p>Balance team assignments and reduce bottlenecks using AI-assisted distribution.</p>

      <section className="ai-form-card">
        <form onSubmit={handleSubmit}>
          <label>
            Team members (name:capacity per week)
            <textarea value={teamMembers} onChange={(event) => setTeamMembers(event.target.value)} placeholder="Alice:8\nBob:10" />
          </label>
          <label>
            Tasks (one per line)
            <textarea value={taskList} onChange={(event) => setTaskList(event.target.value)} placeholder="Task 1\nTask 2" />
          </label>
          <button type="submit">Generate Workload Plan</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="result-card">
            <h2>Workload Assignments</h2>
            {result.balance_score && <p>Balance score: {result.balance_score}</p>}
            <ul>
              {result.assignments.map((assignment, index) => (
                <li key={index}>
                  <strong>{assignment.task}</strong> → {assignment.assignee} ({assignment.estimated_hours}h)
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
}
