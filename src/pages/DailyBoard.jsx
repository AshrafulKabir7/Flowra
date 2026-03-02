import { useState } from 'react'
import { useApp } from '../context/AppContext'
import TaskModal from '../components/TaskModal'
import CategoryBadge from '../components/CategoryBadge'
import {
    getTasksForDate, getTasksByStatus, formatDisplay, formatDayOfWeek,
    addDays, subDays, isTodayDate, formatDate
} from '../utils/helpers'

/* ── Sintask-style Task Card ── */
function SintaskCard({ task, onEdit, onStatusChange, onDelete }) {
    const priorityColors = {
        low: { bg: '#ecfdf5', color: '#16a34a', label: 'Low' },
        medium: { bg: '#fffbeb', color: '#d97706', label: 'Medium' },
        high: { bg: '#fef2f2', color: '#dc2626', label: 'High' },
        urgent: { bg: '#fef2f2', color: '#dc2626', label: 'Urgent' },
    }
    const p = priorityColors[task.priority] || priorityColors.medium

    return (
        <div
            className="st-card"
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('taskId', task.id)
                e.currentTarget.classList.add('dragging')
            }}
            onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
        >
            <div className="st-card-top">
                <span className="st-priority-badge" style={{ background: p.bg, color: p.color }}>
                    {p.label}
                </span>
                <button className="st-menu-btn" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(task) }}>⋯</button>
            </div>
            <div className="st-card-title" onClick={() => onEdit && onEdit(task)}>{task.title}</div>
            {task.description && <div className="st-card-desc">{task.description}</div>}
            <div className="st-card-footer">
                <CategoryBadge category={task.category} />
                <div className="st-card-meta">
                    {task.status !== 'done' && (
                        <button className="st-card-action" onClick={() => onStatusChange && onStatusChange(task.id, 'done')} title="Mark done">
                            ✓
                        </button>
                    )}
                    <button className="st-card-action del" onClick={() => onDelete && onDelete(task.id)} title="Delete">
                        🗑
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function DailyBoard() {
    const { state, dispatch } = useApp()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showModal, setShowModal] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [dragOverColumn, setDragOverColumn] = useState(null)
    const [viewMode, setViewMode] = useState('board') // 'board' or 'table'
    const [filterStatus, setFilterStatus] = useState('all')

    const dateStr = formatDate(currentDate)
    const dayTasks = getTasksForDate(state.tasks, currentDate)
    const columns = getTasksByStatus(dayTasks)

    const filteredTasks = filterStatus === 'all' ? dayTasks : dayTasks.filter(t => t.status === filterStatus)

    const goNext = () => setCurrentDate(prev => addDays(prev, 1))
    const goPrev = () => setCurrentDate(prev => subDays(prev, 1))
    const goToday = () => setCurrentDate(new Date())

    const handleStatusChange = (taskId, newStatus) => {
        dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, status: newStatus } })
    }
    const handleDelete = (taskId) => {
        dispatch({ type: 'DELETE_TASK', payload: taskId })
    }

    const handleDrop = (e, status) => {
        e.preventDefault()
        const taskId = e.dataTransfer.getData('taskId')
        if (taskId) handleStatusChange(taskId, status)
        setDragOverColumn(null)
    }

    const colConfig = [
        { key: 'todo', title: 'To Do', color: '#4a8cff', dotColor: '#4a8cff' },
        { key: 'in-progress', title: 'In Progress', color: '#22c55e', dotColor: '#22c55e' },
        { key: 'done', title: 'Done', color: '#8b5cf6', dotColor: '#8b5cf6' }
    ]

    const [quickTitle, setQuickTitle] = useState('')
    const [quickCat, setQuickCat] = useState('other')

    const handleQuickAdd = (e) => {
        e.preventDefault()
        if (!quickTitle.trim()) return
        dispatch({ type: 'ADD_TASK', payload: { title: quickTitle.trim(), category: quickCat, date: dateStr, status: 'todo' } })
        setQuickTitle('')
    }

    const todoCnt = columns['todo']?.length || 0
    const ipCnt = columns['in-progress']?.length || 0
    const doneCnt = columns['done']?.length || 0

    return (
        <div className="anim-fade">
            {/* Page Header */}
            <div className="pg-header">
                <div>
                    <h1 className="pg-title">Tasks</h1>
                    <p className="pg-subtitle">{formatDayOfWeek(currentDate)} — {formatDisplay(currentDate)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <div className="date-nav">
                        <button className="date-nav-btn" onClick={goPrev}>‹</button>
                        <span className="date-nav-label">{formatDisplay(currentDate)}</span>
                        <button className="date-nav-btn" onClick={goNext}>›</button>
                    </div>
                    {!isTodayDate(currentDate) && <button className="today-btn" onClick={goToday}>Today</button>}
                </div>
            </div>

            {/* View Tabs Bar */}
            <div className="st-toolbar">
                <div className="st-view-tabs">
                    <button className={`st-view-tab ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}>
                        <span className="st-tab-icon">☰</span> Table
                    </button>
                    <button className={`st-view-tab ${viewMode === 'board' ? 'active' : ''}`}
                        onClick={() => setViewMode('board')}>
                        <span className="st-tab-icon">▦</span> Board
                    </button>
                </div>

                {viewMode === 'table' && (
                    <div className="filter-tabs">
                        {[
                            { key: 'all', label: 'All', count: dayTasks.length },
                            { key: 'todo', label: 'To Do', count: todoCnt },
                            { key: 'in-progress', label: 'In Progress', count: ipCnt },
                            { key: 'done', label: 'Completed', count: doneCnt },
                        ].map(f => (
                            <button key={f.key} className={`filter-tab ${filterStatus === f.key ? 'active' : ''}`}
                                onClick={() => setFilterStatus(f.key)}>
                                {f.label} <span className="tab-count">{f.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                <button className="st-add-task-btn" onClick={() => setShowModal(true)}>
                    + Add new task
                </button>
            </div>

            {/* Quick Add */}
            <form className="quick-add" onSubmit={handleQuickAdd}>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>✏️</span>
                <input className="f-input" type="text" placeholder="Quick add a task..."
                    value={quickTitle} onChange={e => setQuickTitle(e.target.value)} />
                <select className="f-select" value={quickCat} onChange={e => setQuickCat(e.target.value)}
                    style={{ width: 'auto', minWidth: 120, background: 'var(--bg-input)' }}>
                    <option value="university">🎓 University</option>
                    <option value="project">💻 Project</option>
                    <option value="personal">🧑 Personal</option>
                    <option value="work">💼 Work</option>
                    <option value="other">📌 Other</option>
                </select>
                <button type="submit" className="btn btn-primary">Add</button>
            </form>

            {/* VIEW: Table */}
            {viewMode === 'table' && (
                <div className="task-table-wrapper anim-fade">
                    {filteredTasks.length === 0 ? (
                        <div className="empty-box" style={{ padding: 'var(--sp-10)' }}>
                            <div className="empty-icon">📋</div>
                            <p className="empty-text">No tasks for this day yet. Start by adding one!</p>
                        </div>
                    ) : (
                        <table className="task-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}></th>
                                    <th>Task</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th style={{ width: 60 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(task => (
                                    <tr key={task.id}>
                                        <td>
                                            <button className={`checkbox ${task.status === 'done' ? 'checked' : ''}`}
                                                onClick={() => handleStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')}>
                                                {task.status === 'done' ? '✓' : ''}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="task-name-cell">
                                                <span style={{ cursor: 'pointer' }} onClick={() => { setEditingTask(task); setShowModal(true) }}>
                                                    {task.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td><CategoryBadge category={task.category} /></td>
                                        <td>
                                            <span className={`priority-flag ${task.priority}`}>
                                                <span className="flag-icon">🚩</span>
                                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${task.status}`}>
                                                <span className="dot" />
                                                {task.status === 'in-progress' ? 'Doing' : task.status === 'todo' ? 'To Do' : 'Done'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>{formatDisplay(task.date, 'd MMM yyyy')}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <button className="task-action" onClick={() => { setEditingTask(task); setShowModal(true) }}>✏️</button>
                                                <button className="task-action del" onClick={() => handleDelete(task.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* VIEW: Sintask-Style Board */}
            {viewMode === 'board' && (
                <div className="st-board anim-fade">
                    {colConfig.map(col => (
                        <div key={col.key}
                            className={`st-column ${dragOverColumn === col.key ? 'drag-over' : ''}`}
                            onDrop={e => handleDrop(e, col.key)}
                            onDragOver={e => { e.preventDefault(); setDragOverColumn(col.key) }}
                            onDragLeave={() => setDragOverColumn(null)}>
                            {/* Colored header strip */}
                            <div className="st-col-header" style={{ '--col-color': col.color }}>
                                <div className="st-col-title">
                                    <span className="st-col-dot" style={{ background: col.dotColor }} />
                                    {col.title}
                                </div>
                                <span className="st-col-count">{columns[col.key]?.length || 0}</span>
                            </div>
                            {/* Cards */}
                            <div className="st-col-cards">
                                {(columns[col.key] || []).map(task => (
                                    <SintaskCard key={task.id} task={task}
                                        onEdit={(t) => { setEditingTask(t); setShowModal(true) }}
                                        onStatusChange={handleStatusChange}
                                        onDelete={handleDelete} />
                                ))}
                                {(columns[col.key] || []).length === 0 && (
                                    <div className="st-empty-col">
                                        Drag tasks here or create a new one
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <TaskModal task={editingTask} defaultDate={dateStr}
                    onClose={() => { setShowModal(false); setEditingTask(null) }} />
            )}
        </div>
    )
}
