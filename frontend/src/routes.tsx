import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import SprintPlanning from './pages/SprintPlanning'
import TaskEstimation from './pages/TaskEstimation'
import TaskManagement from './pages/TaskManagement'
import RiskAnalysis from './pages/RiskAnalysis'
import WorkloadDistribution from './pages/WorkloadDistribution'
import Profile from './pages/Profile'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="theme-container bg-background flex min-h-screen w-full">
          <Sidebar />
          <SidebarInset>
            <header className="sticky w-full top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/75 md:px-4">
              <SidebarTrigger className="md:hidden" />
              <Navbar />
            </header>

            <main className="flex-1 p-4 md:p-6">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <Projects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sprint-planning"
                  element={
                    <ProtectedRoute>
                      <SprintPlanning />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/task-estimation"
                  element={
                    <ProtectedRoute>
                      <TaskEstimation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <TaskManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/risks"
                  element={
                    <ProtectedRoute>
                      <RiskAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workload"
                  element={
                    <ProtectedRoute>
                      <WorkloadDistribution />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  )
}
