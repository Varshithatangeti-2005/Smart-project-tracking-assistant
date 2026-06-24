export interface Project {
  id: number
  name: string
  description?: string
  owner_id: number
}

export interface ProjectCreateData {
  name: string
  description?: string
}
