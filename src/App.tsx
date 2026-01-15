import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import AnaliseCliente from '@/pages/AnaliseCliente'
import Heatmap from '@/pages/Heatmap'
import AnaliseVendedor from '@/pages/AnaliseVendedor'
import Layout from '@/components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analise-cliente"
        element={
          <ProtectedRoute>
            <Layout>
              <AnaliseCliente />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/heatmap"
        element={
          <ProtectedRoute>
            <Layout>
              <Heatmap />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analise-vendedor"
        element={
          <ProtectedRoute>
            <Layout>
              <AnaliseVendedor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
