import type { Sprint } from '../types/Sprint'
import { request } from './api'

export function fetchSprints() {
  return request<Sprint[]>('/sprints')
}

export function updateSprint(sprintId: number, updates: Partial<Pick<Sprint, 'name' | 'start_date' | 'end_date' | 'project_id'>>) {
  return request<Sprint>(`/sprints/${sprintId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}
