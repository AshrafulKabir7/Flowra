import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import CategoryBadge from '../components/CategoryBadge'
import ProgressRing from '../components/ProgressRing'
import TaskModal from '../components/TaskModal'
import {
    getTasksForDate, getCompletionRate, getStreak, getUpcomingTasks,
    getTasksByCategory, formatShortDate, getProjectProgress,
    getCategoryLabel, getCategoryColor, formatDate, subDays
} from '../utils/helpers'

/* ── Donut Chart Component ── */
function DonutChart({ segments, size = 140, thickness = 18 }) {
    const total = segments.reduce((s, d) => s + d.value, 0)
    if (total === 0) {
        return (
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={(size - thickness) / 2}
                    fill="none" stroke="var(--bg-input)" strokeWidth={thickness} />
                <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-tertiary)">0</text>
            </svg>
        )
    }
    const cx = size / 2, cy = size / 2, r = (size - thickness) / 2
    const circumference = 2 * Math.PI * r
    let cumulative = 0

    return (
        <svg width={size} height={size}>
            {segments.map((seg, i) => {
                const pct = seg.value / total
                const dash = pct * circumference
                const gap = circumference - dash
                const rotation = (cumulative / total) * 360 - 90
                cumulative += seg.value
                return (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
                        strokeWidth={thickness} strokeDasharray={`${dash} ${gap}`}
                        transform={`rotate(${rotation} ${cx} ${cy})`} />
                )
            })}
        </svg>
    )
}

/* ── Status Column Widget (vertical layout per reference) ── */
function StatusColumn({ label, value, total, color, dotColor }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className="status-col">
            <div className="status-col-label">
                <span className="status-col-dot" style={{ background: dotColor }} />
                <span>{label}</span>
            </div>
            <div className="status-col-pct">{pct}%</div>
            <div className="status-col-bar-track">
                <div className="status-col-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    )
}

/* ── Activity Bar Chart (last 7 days) ── */
function ActivityChart({ tasks }) {
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=Sun .. 6=Sat

    // Build last 7 days
    const last7 = []
    for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i)
        last7.push({
            label: days[d.getDay()],
            date: formatDate(d),
            tasks: tasks.filter(t => t.date === formatDate(d)),
        })
    }

    const maxTasks = Math.max(1, ...last7.map(d => d.tasks.length))

    // Create "time slots" for the visual heatmap rows
    const timeSlots = ['10:00', '09:30', '09:00', '08:30', '08:00']

    return (
        <div className="activity-chart">
            <div className="activity-grid">
                {/* Time labels column */}
                <div className="activity-time-col">
                    {timeSlots.map(t => <div key={t} className="activity-time-label">{t}</div>)}
                </div>
                {/* Bar columns */}
                {last7.map((day, i) => {
                    const totalTasks = day.tasks.length
                    const doneTasks = day.tasks.filter(t => t.status === 'done').length
                    const ipTasks = day.tasks.filter(t => t.status === 'in-progress').length
                    const todoTasks = totalTasks - doneTasks - ipTasks
                    return (
                        <div key={i} className="activity-day-col">
                            {timeSlots.map((_, si) => {
                                // Fill cells proportionally
                                const cellIndex = timeSlots.length - 1 - si
                                let bg = 'var(--bg-input)'
                                if (cellIndex < totalTasks) {
                                    if (cellIndex < doneTasks) bg = 'var(--blue)'
                                    else if (cellIndex < doneTasks + ipTasks) bg = 'rgba(74,140,255,0.5)'
                                    else bg = 'rgba(74,140,255,0.2)'
                                }
                                return <div key={si} className="activity-cell" style={{ background: bg }} />
                            })}
                            <div className="activity-day-label">{day.label}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function Dashboard() {
    const { state, dispatch } = useApp()
    const [showModal, setShowModal] = useState(false)

    const today = new Date().toISOString().split('T')[0]
    const todayTasks = getTasksForDate(state.tasks, today)
    const allTasks = state.tasks
    const totalTasks = allTasks.length
    const totalDone = allTasks.filter(t => t.status === 'done').length
    const totalIP = allTasks.filter(t => t.status === 'in-progress').length
    const totalTodo = allTasks.filter(t => t.status === 'todo').length
    const streak = getStreak(state.tasks)
    const overdue = allTasks.filter(t => new Date(t.date) < new Date(today) && t.status !== 'done').length
    const upcoming = getUpcomingTasks(state.tasks, 7)

    // Priority counts
    const lowCount = allTasks.filter(t => t.priority === 'low').length
    const medCount = allTasks.filter(t => t.priority === 'medium').length
    const highCount = allTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length

    // Active projects
    const activeProjects = state.projects.filter(p => p.status === 'active')

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0

    // Week tasks for computation
    const weekDone = allTasks.filter(t => {
        const d = new Date(t.date), now = new Date(), weekAgo = new Date(now.getTime() - 7 * 86400000)
        return d >= weekAgo && d <= now && t.status === 'done'
    }).length
    const lastWeekDone = allTasks.filter(t => {
        const d = new Date(t.date), now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 86400000)
        const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000)
        return d >= twoWeeksAgo && d < weekAgo && t.status === 'done'
    }).length
    const weekChange = lastWeekDone > 0 ? Math.round(((weekDone - lastWeekDone) / lastWeekDone) * 100) : (weekDone > 0 ? 100 : 0)

    const toggleTaskDone = (task) => {
        dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, status: task.status === 'done' ? 'todo' : 'done' } })
    }

    return (
        <div className="anim-fade">
            {/* ── Header ── */}
            <div className="pg-header">
                <div>
                    <h1 className="pg-title">Dashboard</h1>
                    <p className="pg-subtitle">Here's what's happening with your tasks today</p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
                    + Create Task
                </button>
            </div>

            {/* ═══════════ TOP ROW: Stats + Priority Chart ═══════════ */}
            <div className="tf-top-row">
                {/* Stats Container */}
                <div className="tf-stats-container">
                    <div className="tf-stat-box">
                        <div className="tf-stat-number">{totalTasks}</div>
                        <div className="tf-stat-label">Total Tasks</div>
                    </div>
                    <div className="tf-stat-divider" />
                    <div className="tf-stat-box">
                        <div className="tf-stat-number">{completionRate}<span className="tf-stat-pct">%</span></div>
                        <div className="tf-stat-label">Completion Rate</div>
                    </div>
                    <div className="tf-stat-divider" />
                    <div className="tf-stat-box">
                        <div className="tf-stat-number">{streak} <span className="tf-stat-unit">Days</span></div>
                        <div className="tf-stat-label">Streak</div>
                    </div>
                    <div className="tf-stat-divider" />
                    <div className="tf-stat-box">
                        <div className="tf-stat-number">{activeProjects.length} <span className="tf-stat-unit">Projects</span></div>
                        <div className="tf-stat-label">Active Projects</div>
                    </div>
                </div>

                {/* Task Priority Donut */}
                <div className="tf-priority-card">
                    <div className="tf-card-head">
                        <div>
                            <div className="tf-card-title">Task Priority</div>
                            <div className="tf-card-sub">Distribution by priority level</div>
                        </div>
                        <button className="tf-dots-btn">⋯</button>
                    </div>
                    <div className="tf-donut-area">
                        <DonutChart segments={[
                            { value: highCount, color: '#2563eb' },
                            { value: medCount, color: '#3b82f6' },
                            { value: lowCount, color: '#cbd5e1' },
                        ]} size={130} thickness={20} />
                        <div className="tf-donut-legend">
                            <div className="tf-legend-item">
                                <span className="tf-legend-dot" style={{ background: '#2563eb' }} />
                                High Priority: <strong>{highCount}</strong>
                            </div>
                            <div className="tf-legend-item">
                                <span className="tf-legend-dot" style={{ background: '#3b82f6' }} />
                                Medium Priority: <strong>{medCount}</strong>
                            </div>
                            <div className="tf-legend-item">
                                <span className="tf-legend-dot" style={{ background: '#cbd5e1' }} />
                                Low Priority: <strong>{lowCount}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ MIDDLE ROW: Status Distribution + Today Focus ═══════════ */}
            <div className="tf-mid-row">
                {/* Task Status Distribution */}
                <div className="tf-status-card">
                    <div className="tf-card-head">
                        <div className="tf-card-title">Task Status Distribution</div>
                        <button className="tf-dots-btn">⋯</button>
                    </div>
                    <div className="status-cols-row">
                        <StatusColumn label="In Progress" value={totalIP} total={totalTasks}
                            color="var(--blue)" dotColor="var(--blue)" />
                        <StatusColumn label="Completed" value={totalDone} total={totalTasks}
                            color="var(--green)" dotColor="var(--green)" />
                        <StatusColumn label="Overdue" value={overdue} total={totalTasks}
                            color="var(--amber)" dotColor="var(--amber)" />
                    </div>
                </div>

                {/* Today Focus / Quick Overview */}
                <div className="tf-focus-card">
                    <div className="tf-card-head">
                        <div className="tf-card-title">Today's Focus</div>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                            {todayTasks.length} tasks • {getCompletionRate(todayTasks)}% done
                        </span>
                    </div>
                    {todayTasks.length === 0 ? (
                        <div className="empty-box" style={{ padding: 'var(--sp-6)' }}>
                            <div className="empty-icon">🎯</div>
                            <p className="empty-text">No tasks for today. Create one to get started!</p>
                        </div>
                    ) : (
                        <div className="focus-list">
                            {todayTasks.slice(0, 5).map(task => (
                                <div key={task.id} className="focus-row">
                                    <button className={`focus-cb ${task.status === 'done' ? 'checked' : ''}`}
                                        onClick={() => toggleTaskDone(task)}>
                                        {task.status === 'done' ? '✓' : ''}
                                    </button>
                                    <span className={`focus-row-title ${task.status === 'done' ? 'done' : ''}`}>{task.title}</span>
                                    <CategoryBadge category={task.category} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════ BOTTOM ROW: Activity + Project Workload ═══════════ */}
            <div className="tf-bot-row">
                {/* Activity Chart */}
                <div className="tf-activity-card">
                    <div className="tf-card-head">
                        <div>
                            <div className="tf-card-title">Weekly Activity</div>
                            <div className="tf-card-sub">Understand your productivity and workload</div>
                        </div>
                        <button className="tf-dots-btn">⋯</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
                        <div className="tf-big-pct">{completionRate}%</div>
                        <div className={`tf-change-badge ${weekChange >= 0 ? 'up' : 'down'}`}>
                            {weekChange >= 0 ? '↑' : '↓'} {Math.abs(weekChange)}%
                        </div>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>vs last week</span>
                    </div>
                    <ActivityChart tasks={allTasks} />
                </div>

                {/* Project Workload Table */}
                <div className="tf-workload-card">
                    <div className="tf-card-head">
                        <div className="tf-card-title">Project Workload</div>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--blue)', fontWeight: 600 }}>See All</button>
                    </div>
                    {state.projects.length === 0 ? (
                        <div className="empty-box" style={{ padding: 'var(--sp-6)' }}>
                            <div className="empty-icon">🚀</div>
                            <p className="empty-text">No projects yet. Create your first project to track workload!</p>
                        </div>
                    ) : (
                        <table className="tf-workload-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Tasks</th>
                                    <th>Done</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.projects.slice(0, 5).map(project => {
                                    const pTasks = allTasks.filter(t => t.projectId === project.id)
                                    const pDone = pTasks.filter(t => t.status === 'done').length
                                    const progress = getProjectProgress(allTasks, project.id)
                                    let statusLabel = 'On Track'
                                    let statusClass = 'on-track'
                                    if (progress >= 80) { statusLabel = 'Almost Done'; statusClass = 'almost-done' }
                                    else if (progress <= 20 && pTasks.length > 0) { statusLabel = 'At Risk'; statusClass = 'at-risk' }
                                    else if (progress >= 40) { statusLabel = 'On Track'; statusClass = 'on-track' }
                                    else { statusLabel = 'Getting Started'; statusClass = 'getting-started' }

                                    return (
                                        <tr key={project.id}>
                                            <td>
                                                <div className="tf-proj-name">
                                                    <div className="tf-proj-dot" style={{ background: project.color }} />
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{project.name}</div>
                                                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                                                            {getCategoryLabel(project.category)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{pTasks.length}</td>
                                            <td style={{ fontWeight: 600 }}>{pDone}</td>
                                            <td>
                                                <span className={`tf-status-pill ${statusClass}`}>
                                                    <span className="tf-status-dot" /> {statusLabel}
                                                </span>
                                            </td>
                                            <td><button className="tf-dots-btn">⋯</button></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && <TaskModal onClose={() => setShowModal(false)} defaultDate={today} />}
            <button className="fab" onClick={() => setShowModal(true)} title="Add new task">+</button>
        </div>
    )
}
