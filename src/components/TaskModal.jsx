import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function TaskModal({ task, onClose, defaultDate }) {
    const { state, dispatch } = useApp()
    const isEditing = !!task

    const [form, setForm] = useState({
        title: '', description: '', category: 'other', priority: 'medium',
        status: 'todo', date: defaultDate || new Date().toISOString().split('T')[0], projectId: ''
    })

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title || '', description: task.description || '',
                category: task.category || 'other', priority: task.priority || 'medium',
                status: task.status || 'todo', date: task.date || new Date().toISOString().split('T')[0],
                projectId: task.projectId || ''
            })
        }
    }, [task])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.title.trim()) return
        if (isEditing) {
            dispatch({ type: 'UPDATE_TASK', payload: { ...form, id: task.id, projectId: form.projectId || null } })
        } else {
            dispatch({ type: 'ADD_TASK', payload: { ...form, projectId: form.projectId || null } })
        }
        onClose()
    }

    const handleDelete = () => { if (task) { dispatch({ type: 'DELETE_TASK', payload: task.id }); onClose() } }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box anim-slide" onClick={e => e.stopPropagation()}>
                <div className="modal-head">
                    <h2>{isEditing ? 'Edit Task' : 'Create Task'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="f-group">
                        <label className="f-label">Task Name</label>
                        <input className="f-input" type="text" placeholder="What needs to be done?"
                            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
                    </div>
                    <div className="f-group">
                        <label className="f-label">Description</label>
                        <textarea className="f-input" placeholder="Add details or notes..."
                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="f-row">
                        <div className="f-group">
                            <label className="f-label">Category</label>
                            <select className="f-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="university">🎓 University</option>
                                <option value="project">💻 Project</option>
                                <option value="personal">🧑 Personal</option>
                                <option value="work">💼 Work</option>
                                <option value="other">📌 Other</option>
                            </select>
                        </div>
                        <div className="f-group">
                            <label className="f-label">Priority</label>
                            <select className="f-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🔴 High</option>
                                <option value="urgent">🔥 Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div className="f-row">
                        <div className="f-group">
                            <label className="f-label">Due Date</label>
                            <input className="f-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                        <div className="f-group">
                            <label className="f-label">Status</label>
                            <select className="f-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>
                    {state.projects.length > 0 && (
                        <div className="f-group">
                            <label className="f-label">Link to Project</label>
                            <select className="f-select" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                                <option value="">No project</option>
                                {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', marginTop: 'var(--sp-6)' }}>
                        {isEditing && <button type="button" className="btn btn-danger" onClick={handleDelete}>🗑️ Delete</button>}
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-lg">
                            {isEditing ? 'Save Changes' : '+ Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
