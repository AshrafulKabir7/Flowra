import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function ProjectModal({ project, onClose }) {
    const { dispatch } = useApp()
    const isEditing = !!project

    const [form, setForm] = useState({
        name: '', description: '', color: '#4a8cff', category: 'project',
        startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'active'
    })

    useEffect(() => {
        if (project) {
            setForm({
                name: project.name || '', description: project.description || '',
                color: project.color || '#4a8cff', category: project.category || 'project',
                startDate: project.startDate || '', endDate: project.endDate || '',
                status: project.status || 'active'
            })
        }
    }, [project])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.name.trim()) return
        if (isEditing) dispatch({ type: 'UPDATE_PROJECT', payload: { ...form, id: project.id } })
        else dispatch({ type: 'ADD_PROJECT', payload: form })
        onClose()
    }

    const handleDelete = () => { if (project) { dispatch({ type: 'DELETE_PROJECT', payload: project.id }); onClose() } }

    const colors = ['#4a8cff', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899']

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box anim-slide" onClick={e => e.stopPropagation()}>
                <div className="modal-head">
                    <h2>{isEditing ? 'Edit Project' : 'New Project'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="f-group">
                        <label className="f-label">Project Name</label>
                        <input className="f-input" type="text" placeholder="Enter project name..."
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                    </div>
                    <div className="f-group">
                        <label className="f-label">Description</label>
                        <textarea className="f-input" placeholder="What's this project about?"
                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="f-group">
                        <label className="f-label">Color</label>
                        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                            {colors.map(c => (
                                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                                    style={{
                                        width: 32, height: 32, borderRadius: 'var(--r-full)', background: c,
                                        border: form.color === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                                        cursor: 'pointer', transition: 'all var(--t-fast)'
                                    }} />
                            ))}
                        </div>
                    </div>
                    <div className="f-row">
                        <div className="f-group">
                            <label className="f-label">Start Date</label>
                            <input className="f-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                        </div>
                        <div className="f-group">
                            <label className="f-label">End Date</label>
                            <input className="f-input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                        </div>
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
                            <label className="f-label">Status</label>
                            <select className="f-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', marginTop: 'var(--sp-6)' }}>
                        {isEditing && <button type="button" className="btn btn-danger" onClick={handleDelete}>🗑️ Delete</button>}
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-lg">
                            {isEditing ? 'Save Changes' : '🚀 Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
