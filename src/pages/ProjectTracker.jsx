import { useState } from 'react'
import { useApp } from '../context/AppContext'
import ProjectModal from '../components/ProjectModal'
import TaskModal from '../components/TaskModal'
import CategoryBadge from '../components/CategoryBadge'
import ProgressRing from '../components/ProgressRing'
import {
    getProjectProgress, getProjectTasks, getTasksByStatus,
    formatShortDate, getCompletionRate, getCategoryLabel
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
                        <button className="st-card-action" onClick={() => onStatusChange && onStatusChange(task.id, 'done')} title="Mark done">✓</button>
                    )}
                    <button className="st-card-action del" onClick={() => onDelete && onDelete(task.id)} title="Delete">🗑</button>
                </div>
            </div>
        </div>
    )
}

export default function ProjectTracker() {
    const { state, dispatch } = useApp()
    const [showProjectModal, setShowProjectModal] = useState(false)
    const [editingProject, setEditingProject] = useState(null)
    const [selectedProject, setSelectedProject] = useState(null)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [projViewMode, setProjViewMode] = useState('board')
    const [dragOverColumn, setDragOverColumn] = useState(null)

    let filteredProjects = state.projects
    if (filterCategory !== 'all') filteredProjects = filteredProjects.filter(p => p.category === filterCategory)
    if (filterStatus !== 'all') filteredProjects = filteredProjects.filter(p => p.status === filterStatus)

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

    /* ─── Project Detail View (Sintask-style) ─── */
    if (selectedProject) {
        const project = state.projects.find(p => p.id === selectedProject)
        if (!project) { setSelectedProject(null); return null }
        const tasks = getProjectTasks(state.tasks, project.id)
        const columns = getTasksByStatus(tasks)
        const progress = getCompletionRate(tasks)

        const colConfig = [
            { key: 'todo', title: 'To Do', color: '#4a8cff', dotColor: '#4a8cff' },
            { key: 'in-progress', title: 'In Progress', color: '#22c55e', dotColor: '#22c55e' },
            { key: 'done', title: 'Done', color: '#8b5cf6', dotColor: '#8b5cf6' }
        ]

        return (
            <div className="anim-fade">
                {/* Breadcrumb */}
                <div className="st-breadcrumb">
                    <button className="st-breadcrumb-link" onClick={() => setSelectedProject(null)}>Projects</button>
                    <span className="st-breadcrumb-sep">/</span>
                    <span className="st-breadcrumb-current">{project.name}</span>
                </div>

                {/* Project Header */}
                <div className="st-project-header">
                    <div className="st-project-title-row">
                        <h1 className="st-project-name">{project.name}</h1>
                        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                            <button className="st-header-btn" onClick={() => { setEditingProject(project); setShowProjectModal(true) }}>✏️</button>
                            <button className="st-header-btn">⋯</button>
                        </div>
                    </div>

                    {/* Project Meta */}
                    <div className="st-project-meta">
                        <div className="st-meta-row">
                            <span className="st-meta-label">📊 Status</span>
                            <span className={`st-status-pill ${project.status}`}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                        </div>
                        <div className="st-meta-row">
                            <span className="st-meta-label">📁 Category</span>
                            <CategoryBadge category={project.category} />
                        </div>
                        {project.startDate && (
                            <div className="st-meta-row">
                                <span className="st-meta-label">📅 Timeline</span>
                                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                                    {formatShortDate(project.startDate)} {project.endDate ? `→ ${formatShortDate(project.endDate)}` : ''}
                                </span>
                            </div>
                        )}
                        {project.description && (
                            <div className="st-meta-row">
                                <span className="st-meta-label">📝 Description</span>
                                <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>{project.description}</span>
                            </div>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="st-project-progress">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>Progress</span>
                            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: project.color }}>{progress}%</span>
                        </div>
                        <div className="proj-progress">
                            <div className="proj-progress-fill" style={{ width: `${progress}%`, background: project.color }} />
                        </div>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="st-toolbar">
                    <div className="st-view-tabs">
                        <button className={`st-view-tab ${projViewMode === 'board' ? 'active' : ''}`}
                            onClick={() => setProjViewMode('board')}>
                            <span className="st-tab-icon">▦</span> Board
                        </button>
                        <button className={`st-view-tab ${projViewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setProjViewMode('table')}>
                            <span className="st-tab-icon">☰</span> Table
                        </button>
                    </div>
                    <button className="st-add-task-btn" onClick={() => setShowTaskModal(true)}>
                        + Add new task
                    </button>
                </div>

                {/* Board */}
                <div className="st-board">
                    {colConfig.map(col => (
                        <div key={col.key}
                            className={`st-column ${dragOverColumn === col.key ? 'drag-over' : ''}`}
                            onDrop={e => handleDrop(e, col.key)}
                            onDragOver={e => { e.preventDefault(); setDragOverColumn(col.key) }}
                            onDragLeave={() => setDragOverColumn(null)}>
                            <div className="st-col-header" style={{ '--col-color': col.color }}>
                                <div className="st-col-title">
                                    <span className="st-col-dot" style={{ background: col.dotColor }} />
                                    {col.title}
                                </div>
                                <span className="st-col-count">{columns[col.key]?.length || 0}</span>
                            </div>
                            <div className="st-col-cards">
                                {(columns[col.key] || []).map(task => (
                                    <SintaskCard key={task.id} task={task}
                                        onEdit={(t) => { setEditingTask(t); setShowTaskModal(true) }}
                                        onStatusChange={handleStatusChange}
                                        onDelete={handleDelete} />
                                ))}
                                {(columns[col.key] || []).length === 0 && (
                                    <div className="st-empty-col">Drag tasks here</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {showTaskModal && (
                    <TaskModal task={editingTask} defaultDate={new Date().toISOString().split('T')[0]}
                        onClose={() => { setShowTaskModal(false); setEditingTask(null) }} />
                )}
                {showProjectModal && (
                    <ProjectModal project={editingProject} onClose={() => { setShowProjectModal(false); setEditingProject(null) }} />
                )}
            </div>
        )
    }

    /* ─── Projects List View ─── */
    return (
        <div className="anim-fade">
            <div className="pg-header">
                <div>
                    <h1 className="pg-title">Projects</h1>
                    <p className="pg-subtitle">Track progress across all your projects</p>
                </div>
                <button className="st-add-task-btn" onClick={() => { setEditingProject(null); setShowProjectModal(true) }}>
                    🚀 New Project
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar" style={{ marginBottom: 'var(--sp-6)' }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Filter:</span>
                {['all', 'university', 'project', 'personal', 'work'].map(c => (
                    <button key={c} className={`filter-chip ${filterCategory === c ? 'active' : ''}`}
                        onClick={() => setFilterCategory(c)}>
                        {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                ))}
                <span style={{ color: 'var(--border)' }}>|</span>
                {['all', 'active', 'paused', 'completed'].map(s => (
                    <button key={s} className={`filter-chip ${filterStatus === s ? 'active' : ''}`}
                        onClick={() => setFilterStatus(s)}>
                        {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {filteredProjects.length === 0 ? (
                <div className="empty-box" style={{ padding: '64px' }}>
                    <div className="empty-icon">🚀</div>
                    <p className="empty-text">
                        {state.projects.length === 0 ? 'No projects yet. Create your first one!' : 'No projects match your filters.'}
                    </p>
                    {state.projects.length === 0 && (
                        <button className="btn btn-primary" style={{ marginTop: 'var(--sp-4)' }}
                            onClick={() => setShowProjectModal(true)}>Create Project</button>
                    )}
                </div>
            ) : (
                <div className="proj-grid">
                    {filteredProjects.map(project => {
                        const tasks = getProjectTasks(state.tasks, project.id)
                        const progress = getProjectProgress(state.tasks, project.id)
                        const doneTasks = tasks.filter(t => t.status === 'done').length

                        return (
                            <div key={project.id} className="proj-card" onClick={() => setSelectedProject(project.id)}>
                                <div className="proj-accent" style={{ background: project.color }} />
                                <div className="proj-card-head">
                                    <div>
                                        <div className="proj-card-name">{project.name}</div>
                                        <div className="proj-card-dates">
                                            {project.startDate && formatShortDate(project.startDate)}
                                            {project.endDate && ` → ${formatShortDate(project.endDate)}`}
                                        </div>
                                    </div>
                                    <ProgressRing progress={progress} size={48} strokeWidth={4} color={project.color} />
                                </div>
                                {project.description && <p className="proj-card-desc">{project.description}</p>}
                                <div className="proj-progress">
                                    <div className="proj-progress-fill" style={{ width: `${progress}%`, background: project.color }} />
                                </div>
                                <div className="proj-meta">
                                    <span><strong>{tasks.length}</strong> tasks</span>
                                    <span><strong>{doneTasks}</strong> done</span>
                                    <CategoryBadge category={project.category} />
                                </div>
                                <button className="btn btn-ghost btn-sm"
                                    style={{ position: 'absolute', top: 'var(--sp-4)', right: 'var(--sp-4)', zIndex: 2 }}
                                    onClick={(e) => { e.stopPropagation(); setEditingProject(project); setShowProjectModal(true) }}>✏️</button>
                            </div>
                        )
                    })}
                </div>
            )}

            {showProjectModal && (
                <ProjectModal project={editingProject} onClose={() => { setShowProjectModal(false); setEditingProject(null) }} />
            )}
        </div>
    )
}
