import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DailyBoard from './pages/DailyBoard'
import MonthlyView from './pages/MonthlyView'
import YearlyPlanner from './pages/YearlyPlanner'
import ProjectTracker from './pages/ProjectTracker'

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/daily" element={<DailyBoard />} />
                <Route path="/monthly" element={<MonthlyView />} />
                <Route path="/yearly" element={<YearlyPlanner />} />
                <Route path="/projects" element={<ProjectTracker />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    )
}
