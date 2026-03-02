import { useApp } from '../context/AppContext'
import Sidebar from './Sidebar'
import { formatDisplay, formatDayOfWeek } from '../utils/helpers'

export default function Layout({ children }) {
    const { state, dispatch } = useApp()
    const { theme, sidebarCollapsed } = state.settings

    const toggleTheme = () => {
        dispatch({ type: 'SET_THEME', payload: theme === 'dark' ? 'light' : 'dark' })
    }

    const today = new Date()
    const initials = 'AK' // user initials

    return (
        <div className="app-layout">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} />
            <div className={`main-wrapper ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="topbar-greeting">
                            <div className="greeting-text">Welcome back! 👋</div>
                            <div className="greeting-sub">{formatDayOfWeek(today)}, {formatDisplay(today)}</div>
                        </div>
                    </div>
                    <div className="topbar-search">
                        <span className="search-icon">🔍</span>
                        <input type="text" placeholder="Search tasks, projects..." />
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-btn" onClick={toggleTheme} title="Toggle theme">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button className="topbar-btn" title="Notifications">🔔</button>
                        <div className="user-avatar">{initials}</div>
                    </div>
                </header>
                <main className="page-container">
                    {children}
                </main>
            </div>
        </div>
    )
}
