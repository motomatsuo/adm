import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Portal Analytics</h1>
        <div className="header-actions">
          <span className="user-name">{user?.nome || user?.email}</span>
          <button onClick={handleSignOut} className="logout-button">
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
