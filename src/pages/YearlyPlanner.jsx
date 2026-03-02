import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import StatsCard from '../components/StatsCard'
import {
    getMonthsOfYear, getCalendarDays, getTasksForDate, getTasksForYear,
    getCompletionRate, getTasksByCategory, getHeatmapLevel,
    formatShortMonth, getCategoryLabel, getCategoryColor, isTodayDate
} from '../utils/helpers'

export default function YearlyPlanner() {
    const { state } = useApp()
    const navigate = useNavigate()
    const [year, setYear] = useState(new Date().getFullYear())

    const months = getMonthsOfYear(year)
    const yearTasks = getTasksForYear(state.tasks, year)
    const yearDone = yearTasks.filter(t => t.status === 'done').length
    const yearIP = yearTasks.filter(t => t.status === 'in-progress').length
    const yearCompletion = getCompletionRate(yearTasks)

    const catEntries = Object.entries(getTasksByCategory(yearTasks))
        .map(([cat, tasks]) => ({ cat, count: tasks.length }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count)

    let bestMonth = null, bestMonthCount = 0
    months.forEach(m => {
        const done = yearTasks.filter(t => new Date(t.date).getMonth() === m.getMonth() && t.status === 'done').length
        if (done > bestMonthCount) { bestMonthCount = done; bestMonth = m }
    })

    return (
        <div className="anim-fade">
            <div className="pg-header">
                <div>
                    <h1 className="pg-title">Yearly Planner</h1>
                    <p className="pg-subtitle">Your year at a glance — click a month to explore</p>
                </div>
                <div className="date-nav">
                    <button className="date-nav-btn" onClick={() => setYear(y => y - 1)}>‹</button>
                    <span className="date-nav-label">{year}</span>
                    <button className="date-nav-btn" onClick={() => setYear(y => y + 1)}>›</button>
                </div>
            </div>

            <div className="year-stats-row stagger">
                <StatsCard icon="📋" value={yearTasks.length} label="Total Tasks" colorClass="blue" />
                <StatsCard icon="✅" value={yearDone} label="Completed" colorClass="green" />
                <StatsCard icon="⚡" value={yearIP} label="In Progress" colorClass="amber" />
                <StatsCard icon="📈" value={`${yearCompletion}%`} label="Completion" colorClass="purple" />
            </div>

            {catEntries.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
                    <h3 className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>Category Distribution</h3>
                    <div style={{ display: 'flex', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
                        {catEntries.map(({ cat, count }) => (
                            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--r-md)',
                                    background: `${getCategoryColor(cat)}1a`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 'var(--fs-lg)', fontWeight: 800, color: getCategoryColor(cat)
                                }}>{count}</div>
                                <div>
                                    <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{getCategoryLabel(cat)}</div>
                                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                                        {Math.round((count / yearTasks.length) * 100)}% of total
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="year-grid">
                {months.map((month) => {
                    const days = getCalendarDays(month)
                    const mTasks = yearTasks.filter(t => new Date(t.date).getMonth() === month.getMonth())
                    const mDone = mTasks.filter(t => t.status === 'done').length

                    return (
                        <div key={month.toISOString()} className="mini-month" onClick={() => navigate('/monthly')}>
                            <div className="mini-month-title">
                                <span>{formatShortMonth(month)}</span>
                                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{mTasks.length} tasks</span>
                            </div>
                            <div className="mini-month-grid">
                                {days.filter(d => d.isCurrentMonth).map((day, i) => {
                                    const count = getTasksForDate(state.tasks, day.date).length
                                    const level = getHeatmapLevel(count)
                                    const today = isTodayDate(day.date)
                                    return (
                                        <div key={i} className={`hm-cell ${level > 0 ? `l${level}` : ''}`}
                                            title={`${new Date(day.date).getDate()}: ${count} tasks`}
                                            style={today ? { boxShadow: '0 0 0 1px var(--blue)', borderRadius: '3px' } : {}} />
                                    )
                                })}
                            </div>
                            {mTasks.length > 0 && (
                                <div style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{mDone} done</span>
                                    <span>{getCompletionRate(mTasks)}%</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {bestMonth && bestMonthCount > 0 && (
                <div className="card" style={{ marginTop: 'var(--sp-8)', textAlign: 'center', padding: 'var(--sp-6)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-2)' }}>🏆</div>
                    <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 700 }}>Best Month: {formatShortMonth(bestMonth)}</div>
                    <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>{bestMonthCount} tasks completed</div>
                </div>
            )}
        </div>
    )
}
