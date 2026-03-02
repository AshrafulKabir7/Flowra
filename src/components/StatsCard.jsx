export default function StatsCard({ icon, value, label, colorClass = 'blue' }) {
    return (
        <div className="stat-card">
            <div className={`stat-icon-box ${colorClass}`}>{icon}</div>
            <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
            </div>
        </div>
    )
}
