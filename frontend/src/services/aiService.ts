import { request } from './api'

export function taskEstimation(payload: {
  task_name: string
  task_description: string
  priority?: string
  deadline_days?: number
  team_experience_level?: string
  complexity_factors?: string[]
}) {
  return request<{ min_hours: number; max_hours: number; difficulty: string; confidence?: string; reasoning?: string; suggested_sprints?: string[]; notes?: string }>(
    '/ai/task-estimation',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
}

export function sprintPlanning(payload: {
  project_name: string
  tasks: string[]
  duration_weeks: number
  team_capacity_per_week: number
  objectives?: string
}) {
  return request<{ sprint_outlines: Array<{ name: string; tasks: string[]; start_date: string; end_date: string; duration_days: number }>; recommended_sprint_count: number; summary?: string }>(
    '/ai/sprint-planning',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
}

export function riskAnalysis(payload: {
  project_name: string
  deadline_days: number
  pending_tasks: number
  developers: number
  blockers?: string[]
  technical_debt?: string
  current_phase?: string
}) {
  return request<{ risk_level: string; top_risks: string[]; mitigation_actions: string[]; confidence?: string }>(
    '/ai/risk-analysis',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
}

export function workloadDistribution(payload: {
  team: Record<string, number>
  tasks: { title: string; priority?: string; estimated_hours?: number }[]
}) {
  return request<{ assignments: { task: string; assignee: string; estimated_hours: number }[]; balance_score?: string }>(
    '/ai/workload-distribution',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
}
