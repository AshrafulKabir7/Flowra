import { useState } from 'react'
import { useApp } from '../context/AppContext'
import TaskModal from '../components/TaskModal'
import {
    getCalendarDays, getTasksForDate, getTasksForMonth, getCompletionRate,
    getTasksByCategory, formatMonthYear, formatDate, addMonths, subMonths,
    isTodayDate, getCategoryLabel, getCategoryColor
} from '../utils/helpers'

export default function MonthlyView() {
    const { state } = useApp()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showModal, setShowModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)

    const calendarDays = getCalendarDays(currentDate)
    const monthTasks = getTasksForMonth(state.tasks, currentDate)
    const monthCompletion = getCompletionRate(monthTasks)
    const monthDone = monthTasks.filter(t => t.status === 'done').length
    const monthIP = monthTasks.filter(t => t.status === 'in-progress').length
    const monthTodo = monthTasks.filter(t => t.status === 'todo').length

    const catBreakdown = getTasksByCategory(monthTasks)
    const catEntries = Object.entries(catBreakdown)
        .map(([cat, tasks]) => ({ cat, count: tasks.length }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count)
    const catTotal = catEntries.reduce((s, c) => s + c.count, 0)

    let busiestDay = null, busiestCount = 0
    calendarDays.forEach(d => {
        if (d.isCurrentMonth) {
            const count = getTasksForDate(state.tasks, d.date).length
            if (count > busiestCount) { busiestCount = count; busiestDay = d.date }
        }
    })

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="anim-fade">
            <div className="pg-header">
                <div>
                    <h1 className="pg-title">Calendar</h1>
                    <p className="pg-subtitle">Click any day to add tasks</p>
                </div>
                <div className="date-nav">
                    <button className="date-nav-btn" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>‹</button>
                    <span className="date-nav-label">{formatMonthYear(currentDate)}</span>
                    <button className="date-nav-btn" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>›</button>
                </div>
            </div>

            <div className="monthly-layout">
                <div>
                    <div className="cal-grid">
                        {weekDays.map(d => (
                            <div key={d} className="cal-head">{d}</div>
                        ))}
                        {calendarDays.map((day, i) => {
                            const dayTasks = getTasksForDate(state.tasks, day.date)
                            const isToday = isTodayDate(day.date)
                            return (
                                <div key={i}
                                    className={`cal-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                                    onClick={() => { setSelectedDate(formatDate(day.date)); setShowModal(true) }}>
                                    <div className="cal-day">{new Date(day.date).getDate()}</div>
                                    <div className="cal-dots">
                                        {dayTasks.slice(0, 6).map((t, j) => (
                                            <div key={j} className={`cal-dot ${t.category}`} />
                                        ))}
                                        {dayTasks.length > 6 && (
                                            <span style={{ fontSize: '8px', color: 'var(--text-tertiary)' }}>+{dayTasks.length - 6}</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="month-stats">
                    <h3>📊 Monthly Stats</h3>
                    <div className="stat-line">
                        <span className="stat-line-label">Total Tasks</span>
                        <span className="stat-line-val">{monthTasks.length}</span>
                    </div>
                    <div className="stat-line">
                        <span className="stat-line-label">Completed</span>
                        <span className="stat-line-val" style={{ color: 'var(--green)' }}>{monthDone}</span>
                    </div>
                    <div className="stat-line">
                        <span className="stat-line-label">In Progress</span>
                        <span className="stat-line-val" style={{ color: 'var(--blue)' }}>{monthIP}</span>
                    </div>
                    <div className="stat-line">
                        <span className="stat-line-label">To Do</span>
                        <span className="stat-line-val" style={{ color: 'var(--text-tertiary)' }}>{monthTodo}</span>
                    </div>
                    <div className="stat-line">
                        <span className="stat-line-label">Completion</span>
                        <span className="stat-line-val">{monthCompletion}%</span>
                    </div>
                    {busiestDay && busiestCount > 0 && (
                        <div className="stat-line">
                            <span className="stat-line-label">Busiest Day</span>
                            <span className="stat-line-val">{new Date(busiestDay).getDate()}th ({busiestCount})</span>
                        </div>
                    )}
                    {catTotal > 0 && (
                        <div style={{ marginTop: 'var(--sp-5)' }}>
                            <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>Categories</h4>
                            <div className="cat-bar">
                                {catEntries.map(({ cat, count }) => (
                                    <div key={cat} className="cat-bar-seg" style={{ width: `${(count / catTotal) * 100}%`, background: getCategoryColor(cat) }} />
                                ))}
                            </div>
                            <div className="cat-legend">
                                {catEntries.map(({ cat, count }) => (
                                    <div key={cat} className="cat-legend-item">
                                        <div className="cat-legend-dot" style={{ background: getCategoryColor(cat) }} />
                                        {getCategoryLabel(cat)} ({count})
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showModal && selectedDate && (
                <TaskModal defaultDate={selectedDate} onClose={() => { setShowModal(false); setSelectedDate(null) }} />
            )}
        </div>
    )
}
