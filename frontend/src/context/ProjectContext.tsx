import { createContext, useState, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { fetchProjects as fetchProjectsService, createProject as createProjectService } from '../services/projectService'
import type { Project, ProjectCreateData } from '../types/Project'

interface ProjectContextType {
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
  loadProjects: () => Promise<void>
  createProject: (data: ProjectCreateData) => Promise<Project>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])

  const loadProjects = async () => {
    if (!token) return
    try {
      const data = await fetchProjectsService()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects', error)
    }
  }

  const createProject = async (project: ProjectCreateData) => {
    const created = await createProjectService(project)
    setProjects((current) => [...current, created])
    return created
  }

  return (
    <ProjectContext.Provider value={{ projects, setProjects, loadProjects, createProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}
