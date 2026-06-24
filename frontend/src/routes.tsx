import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import SprintPlanning from './pages/SprintPlanning'
import TaskEstimation from './pages/TaskEstimation'
import TaskManagement from './pages/TaskManagement'
import RiskAnalysis from './pages/RiskAnalysis'
import WorkloadDistribution from './pages/WorkloadDistribution'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <Sidebar />
        <main className="content-area">
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
