export interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority: string
  due_date?: string
  project_id: number
  assignee_id?: number
}

export interface TaskCreateData {
  title: string
  description?: string
  status?: string
  priority?: string
  due_date?: string
  project_id: number
  assignee_id?: number
}
