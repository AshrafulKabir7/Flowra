import {
    format, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
    addMonths, subMonths, addDays, subDays, startOfYear, endOfYear, eachMonthOfInterval,
    isSameMonth, differenceInDays, isWithinInterval, parseISO
} from 'date-fns'

// ---- Date Helpers ----
export const formatDate = (date, fmt = 'yyyy-MM-dd') => format(new Date(date), fmt)
export const formatDisplay = (date, fmt = 'MMMM d, yyyy') => format(new Date(date), fmt)
export const formatMonthYear = (date) => format(new Date(date), 'MMMM yyyy')
export const formatShortMonth = (date) => format(new Date(date), 'MMM')
export const formatDayOfWeek = (date) => format(new Date(date), 'EEEE')
export const formatShortDate = (date) => format(new Date(date), 'MMM d')
export const isTodayDate = (date) => isToday(new Date(date))
export const isSameDayDate = (d1, d2) => isSameDay(new Date(d1), new Date(d2))

export { addMonths, subMonths, addDays, subDays, startOfYear, endOfYear, startOfMonth, endOfMonth, isSameMonth, parseISO }

// ---- Calendar Helpers ----
export function getCalendarDays(date) {
    const start = startOfMonth(new Date(date))
    const end = endOfMonth(new Date(date))
    const days = eachDayOfInterval({ start, end })

    // Pad start with previous month days
    const startDay = getDay(start)
    const paddedDays = []
    for (let i = startDay; i > 0; i--) {
        paddedDays.push({ date: subDays(start, i), isCurrentMonth: false })
    }
    days.forEach(d => paddedDays.push({ date: d, isCurrentMonth: true }))

    // Pad end to fill last week
    const remaining = 7 - (paddedDays.length % 7)
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            paddedDays.push({ date: addDays(end, i), isCurrentMonth: false })
        }
    }

    return paddedDays
}

export function getMonthsOfYear(year) {
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    return eachMonthOfInterval({ start, end })
}

// ---- Task Grouping ----
export function getTasksForDate(tasks, date) {
    return tasks.filter(t => isSameDayDate(t.date, date))
}

export function getTasksForMonth(tasks, date) {
    return tasks.filter(t => isSameMonth(new Date(t.date), new Date(date)))
}

export function getTasksForYear(tasks, year) {
    return tasks.filter(t => new Date(t.date).getFullYear() === year)
}

export function getTasksByCategory(tasks) {
    const grouped = { university: [], project: [], personal: [], work: [], other: [] }
    tasks.forEach(t => {
        const cat = t.category || 'other'
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(t)
    })
    return grouped
}

export function getTasksByStatus(tasks) {
    return {
        todo: tasks.filter(t => t.status === 'todo'),
        'in-progress': tasks.filter(t => t.status === 'in-progress'),
        done: tasks.filter(t => t.status === 'done')
    }
}

// ---- Statistics ----
export function getCompletionRate(tasks) {
    if (tasks.length === 0) return 0
    const done = tasks.filter(t => t.status === 'done').length
    return Math.round((done / tasks.length) * 100)
}

export function getStreak(tasks) {
    let streak = 0
    let checkDate = new Date()

    while (true) {
        const dayTasks = getTasksForDate(tasks, checkDate)
        const hasDone = dayTasks.some(t => t.status === 'done')
        if (hasDone) {
            streak++
            checkDate = subDays(checkDate, 1)
        } else {
            break
        }
    }
    return streak
}

export function getHeatmapLevel(count) {
    if (count === 0) return 0
    if (count <= 2) return 1
    if (count <= 4) return 2
    if (count <= 6) return 3
    return 4
}

export function getCategoryColor(category) {
    const colors = {
        university: 'var(--cat-university)',
        project: 'var(--cat-project)',
        personal: 'var(--cat-personal)',
        work: 'var(--cat-work)',
        other: 'var(--cat-other)'
    }
    return colors[category] || colors.other
}

export function getPriorityLabel(priority) {
    const labels = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }
    return labels[priority] || priority
}

export function getCategoryLabel(category) {
    const labels = { university: 'University', project: 'Project', personal: 'Personal', work: 'Work', other: 'Other' }
    return labels[category] || category
}

// ---- Project Helpers ----
export function getProjectProgress(tasks, projectId) {
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    return getCompletionRate(projectTasks)
}

export function getProjectTasks(tasks, projectId) {
    return tasks.filter(t => t.projectId === projectId)
}

// ---- ID Generation ----
export function generateId() {
    return crypto.randomUUID()
}

// ---- Get upcoming tasks in the next N days ----
export function getUpcomingTasks(tasks, days = 7) {
    const today = new Date()
    const end = addDays(today, days)
    return tasks
        .filter(t => {
            const d = new Date(t.date)
            return d >= today && d <= end && t.status !== 'done'
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
}
