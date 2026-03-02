import { createContext, useContext, useReducer, useEffect } from 'react'
import { loadState, saveState } from '../utils/storage'
import { generateId } from '../utils/helpers'

const AppContext = createContext()

const defaultState = {
    tasks: [],
    projects: [],
    settings: {
        theme: 'light',
        sidebarCollapsed: false
    }
}

function appReducer(state, action) {
    switch (action.type) {
        case 'ADD_TASK': {
            const task = {
                id: generateId(),
                title: '',
                description: '',
                category: 'other',
                status: 'todo',
                priority: 'medium',
                date: new Date().toISOString().split('T')[0],
                projectId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...action.payload
            }
            return { ...state, tasks: [...state.tasks, task] }
        }

        case 'UPDATE_TASK': {
            return {
                ...state,
                tasks: state.tasks.map(t =>
                    t.id === action.payload.id
                        ? { ...t, ...action.payload, updatedAt: new Date().toISOString() }
                        : t
                )
            }
        }

        case 'DELETE_TASK': {
            return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }
        }

        case 'ADD_PROJECT': {
            const project = {
                id: generateId(),
                name: '',
                description: '',
                color: '#3b82f6',
                category: 'project',
                startDate: new Date().toISOString().split('T')[0],
                endDate: null,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...action.payload
            }
            return { ...state, projects: [...state.projects, project] }
        }

        case 'UPDATE_PROJECT': {
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.id
                        ? { ...p, ...action.payload, updatedAt: new Date().toISOString() }
                        : p
                )
            }
        }

        case 'DELETE_PROJECT': {
            return {
                ...state,
                projects: state.projects.filter(p => p.id !== action.payload),
                tasks: state.tasks.map(t =>
                    t.projectId === action.payload ? { ...t, projectId: null } : t
                )
            }
        }

        case 'SET_THEME': {
            return { ...state, settings: { ...state.settings, theme: action.payload } }
        }

        case 'TOGGLE_SIDEBAR': {
            return {
                ...state,
                settings: { ...state.settings, sidebarCollapsed: !state.settings.sidebarCollapsed }
            }
        }

        default:
            return state
    }
}

export function AppProvider({ children }) {
    const saved = loadState()
    const [state, dispatch] = useReducer(appReducer, saved || defaultState)

    // Persist to localStorage on every state change
    useEffect(() => {
        saveState(state)
    }, [state])

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', state.settings.theme)
    }, [state.settings.theme])

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be used within AppProvider')
    return ctx
}
