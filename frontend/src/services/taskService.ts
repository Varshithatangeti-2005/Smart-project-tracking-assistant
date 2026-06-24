import type { TaskCreateData, Task } from '../types/Task'
import { request } from './api'

export function fetchTasks() {
  return request<Task[]>('/tasks')
}

export function createTask(data: TaskCreateData) {
  return request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateTask(taskId: number, updates: Partial<TaskCreateData>) {
  return request<Task>(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export function deleteTask(taskId: number) {
  return request<void>(`/tasks/${taskId}`, {
    method: 'DELETE',
  })
}
