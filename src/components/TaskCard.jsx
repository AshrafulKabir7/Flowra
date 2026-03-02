import CategoryBadge from './CategoryBadge'

export default function TaskCard({ task, onEdit, onStatusChange }) {
    return (
        <div
            className="task-card"
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('taskId', task.id)
                e.currentTarget.classList.add('dragging')
            }}
            onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
        >
            <div className="task-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <span className={`priority-flag ${task.priority}`}>
                        <span className="flag-icon">🚩</span>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                </div>
                <button className="btn-icon sm task-action" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(task); }} style={{ opacity: 0.5 }}>⋯</button>
            </div>
            <div className="task-card-title">{task.title}</div>
            {task.description && <div className="task-card-desc">{task.description}</div>}
            <div className="task-card-bottom">
                <div className="task-card-meta">
                    <CategoryBadge category={task.category} />
                </div>
                <div className="task-card-actions">
                    <button className="task-action" onClick={() => onEdit && onEdit(task)} title="Edit">✏️</button>
                    {task.status !== 'done' && (
                        <button className="task-action" onClick={() => onStatusChange && onStatusChange(task.id, 'done')} title="Done">✓</button>
                    )}
                </div>
            </div>
        </div>
    )
}
