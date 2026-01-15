import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  email: string
  nome: string
  funcao: string
  foto_perfil: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const result = await apiClient.getSession()
      if (result.data?.user) {
        setUser(result.data.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    checkSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await apiClient.signIn(email, password)
    if (result.error) {
      throw new Error(result.error)
    }
    if (result.data?.user) {
      setUser(result.data.user)
    }
  }

  const signOut = async () => {
    const result = await apiClient.signOut()
    if (result.error) {
      throw new Error(result.error)
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
