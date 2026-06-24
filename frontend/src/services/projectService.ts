import type { ProjectCreateData, Project } from '../types/Project'
import { request } from './api'

export function fetchProjects() {
  return request<Project[]>('/projects')
}

export function createProject(data: ProjectCreateData) {
  return request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
