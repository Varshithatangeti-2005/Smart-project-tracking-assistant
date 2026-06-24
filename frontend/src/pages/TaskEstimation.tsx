import { FormEvent, useState } from 'react'
import { taskEstimation } from '../services/aiService'

export default function TaskEstimation() {
  const [taskName, setTaskName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [deadlineDays, setDeadlineDays] = useState(7)
  const [experience, setExperience] = useState('Intermediate')
  const [factors, setFactors] = useState('')
  const [result, setResult] = useState<null | { min_hours: number; max_hours: number; difficulty: string; confidence?: string; reasoning?: string; notes?: string }>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)

    try {
      const complexityFactors = factors
        .split('\n')
        .map((factor) => factor.trim())
        .filter(Boolean)

      const response = await taskEstimation({
        task_name: taskName || 'New task',
        task_description: description,
        priority,
        deadline_days: deadlineDays,
        team_experience_level: experience,
        complexity_factors: complexityFactors,
      })

      setResult(response)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <main className="page task-estimation-page">
      <h1>Task Estimation</h1>
      <p>Use AI to estimate effort and difficulty for a task.</p>

      <section className="ai-form-card">
        <form onSubmit={handleSubmit}>
          <label>
            Task Name
            <input value={taskName} onChange={(event) => setTaskName(event.target.value)} placeholder="Task name" />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the task" />
          </label>
          <label>
            Priority
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </label>
          <label>
            Deadline (days)
            <input type="number" value={deadlineDays} onChange={(event) => setDeadlineDays(Number(event.target.value))} min={1} />
          </label>
          <label>
            Team experience
            <select value={experience} onChange={(event) => setExperience(event.target.value)}>
              <option value="Junior">Junior</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Senior">Senior</option>
            </select>
          </label>
          <label>
            Complexity factors (one per line)
            <textarea value={factors} onChange={(event) => setFactors(event.target.value)} placeholder="Third-party integration\nUnknown API complexity" />
          </label>
          <button type="submit">Estimate Task</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="result-card">
            <h2>Estimation Result</h2>
            <div style={{ marginBottom: '16px' }}>
              <strong>Estimated Hours</strong>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                {result.min_hours}-{result.max_hours} Hours
              </pre>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Difficulty</strong>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                {result.difficulty}
              </pre>
            </div>
            {result.confidence && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Confidence</strong>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                  {result.confidence}
                </pre>
              </div>
            )}
            {result.reasoning && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Reasoning</strong>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '4px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {result.reasoning}
                </pre>
              </div>
            )}
            {result.notes && (
              <div>
                <strong>Notes</strong>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '4px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {result.notes}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
