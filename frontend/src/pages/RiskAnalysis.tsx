import { useState, useEffect } from 'react'
import { useProject } from '@/context/ProjectContext'
import { riskAnalysis } from '../services/aiService'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner'

export default function RiskAnalysis() {
  const { projects, loadProjects } = useProject()
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
  const [deadlineDays, setDeadlineDays] = useState(14)
  const [pendingTasks, setPendingTasks] = useState(10)
  const [developers, setDevelopers] = useState(3)
  const [blockers, setBlockers] = useState('')
  const [technicalDebt, setTechnicalDebt] = useState('')
  const [currentPhase, setCurrentPhase] = useState('Planning')
  const [result, setResult] = useState<null | { risk_level: string; top_risks: string[]; mitigation_actions: string[]; confidence?: string }>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)
    setIsLoading(true)

    try {
      const projectName = selectedProject?.name || 'Project X'

      const response = await riskAnalysis({
        project_name: projectName,
        deadline_days: deadlineDays,
        pending_tasks: pendingTasks,
        developers,
        blockers: blockers ? blockers.split('\n').map((item) => item.trim()).filter(Boolean) : undefined,
        technical_debt: technicalDebt || undefined,
        current_phase: currentPhase,
      })

      setResult(response)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page risk-page">
      <h1>Risk Analysis</h1>
      <p>Identify and manage risks for your projects and sprints.</p>

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

            <label htmlFor="phase">
              Current Phase
              <select
                id="phase"
                value={currentPhase}
                onChange={(event) => setCurrentPhase(event.target.value)}
              >
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Deployment">Deployment</option>
              </select>
            </label>

            <label htmlFor="deadline">
              Deadline (days)
              <input
                id="deadline"
                type="number"
                value={deadlineDays}
                onChange={(event) => setDeadlineDays(Number(event.target.value))}
                min={1}
              />
            </label>

            <label htmlFor="pending-tasks">
              Pending Tasks
              <input
                id="pending-tasks"
                type="number"
                value={pendingTasks}
                onChange={(event) => setPendingTasks(Number(event.target.value))}
                min={0}
              />
            </label>

            <label htmlFor="developers">
              Developers
              <input
                id="developers"
                type="number"
                value={developers}
                onChange={(event) => setDevelopers(Number(event.target.value))}
                min={1}
              />
            </label>
          </div>

          <label htmlFor="blockers">
            Blockers (one per line)
            <textarea
              id="blockers"
              value={blockers}
              onChange={(event) => setBlockers(event.target.value)}
              placeholder="Blocked by API, delayed dependencies"
              rows={3}
            />
          </label>

          <label htmlFor="tech-debt">
            Technical Debt Notes
            <textarea
              id="tech-debt"
              value={technicalDebt}
              onChange={(event) => setTechnicalDebt(event.target.value)}
              placeholder="Known technical debt"
              rows={3}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading || !selectedProjectId}
            style={{
              width: '100%',
              opacity: isLoading || !selectedProjectId ? 0.6 : 1,
              cursor: isLoading || !selectedProjectId ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Risk'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {isLoading && <LoadingSpinner message="AI Assistant is analyzing project risks..." size="medium" />}

        {result && !isLoading && (
          <div className="result-card">
            <h2>Risk Summary</h2>
            <p>Risk level: {result.risk_level}</p>
            {result.confidence && <p>Confidence: {result.confidence}</p>}
            <h3>Top Risks</h3>
            <ul>
              {result.top_risks.map((risk, index) => (
                <li key={index}>⚠️ {risk}</li>
              ))}
            </ul>
            <h3>Mitigation Actions</h3>
            <ul>
              {result.mitigation_actions.map((action, index) => (
                <li key={index}>✓ {action}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
}
