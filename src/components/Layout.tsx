import Sidebar from './Sidebar'
import Header from './Header'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-content">
        <Header />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
