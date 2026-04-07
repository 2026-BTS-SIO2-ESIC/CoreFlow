const RAW_API_URL = import.meta.env.API_URL || 'http://localhost:3000'

export const API_URL = RAW_API_URL.replace(/\/+$/, '')
export const API_PREFIX = `${API_URL}/api`

export function apiUrl(path = '') {
    const normalized = String(path).replace(/^\/+/, '')
    return `${API_PREFIX}/${normalized}`
}

export function assetUrl(path = '') {
    const normalized = String(path).replace(/^\/+/, '')
    return `${API_URL}/${normalized}`
}
