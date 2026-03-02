// localStorage helpers with error handling

const STORAGE_KEY = 'projectimeline_state'

export function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw)
    } catch (e) {
        console.warn('Failed to load state from localStorage:', e)
        return null
    }
}

export function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
        console.warn('Failed to save state to localStorage:', e)
    }
}
