import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Sidebar({ collapsed, onToggle }) {
    const { state } = useApp()
    const taskCount = state.tasks.length
    const projectCount = state.projects.length

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-mark">P</div>
                <span className="logo-text">Projectimeline</span>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">Menu</div>

                <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">Dashboard</span>
                </NavLink>

                <NavLink to="/daily" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📋</span>
                    <span className="nav-text">Tasks</span>
                </NavLink>

                <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🚀</span>
                    <span className="nav-text">Projects</span>
                </NavLink>

                <div className="nav-section-label">Planning</div>

                <NavLink to="/monthly" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📅</span>
                    <span className="nav-text">Calendar</span>
                </NavLink>

                <NavLink to="/yearly" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🗓️</span>
                    <span className="nav-text">Year Planner</span>
                </NavLink>
            </nav>

            <div className="sidebar-bottom">
                <button className="collapse-toggle" onClick={onToggle}>
                    <span style={{ fontSize: 'var(--fs-md)' }}>{collapsed ? '→' : '←'}</span>
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    )
}
