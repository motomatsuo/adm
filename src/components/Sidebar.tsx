import { NavLink } from 'react-router-dom'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Analytics</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className="nav-item">
          <span>Home</span>
        </NavLink>
        <NavLink to="/analise-cliente" className="nav-item">
          <span>Análise de Cliente</span>
        </NavLink>
        <NavLink to="/heatmap" className="nav-item">
          <span>Heatmap</span>
        </NavLink>
        <NavLink to="/analise-vendedor" className="nav-item">
          <span>Análise de Vendedor</span>
        </NavLink>
      </nav>
    </aside>
  )
}
