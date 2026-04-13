import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './style.css'
import App from './App.vue'
import './assets/style.css'
import router from './router'

const rawApiBase = import.meta.env.VITE_API_BASE
const API_BASE = rawApiBase && rawApiBase !== 'undefined' ? rawApiBase.replace(/\/$/, '') : 'http://localhost:3000'
const originalFetch = window.fetch.bind(window)

function resolveRequestUrl(url) {
	if (!url) {
		return url
	}

	let normalizedUrl = String(url).trim()

	if (normalizedUrl.startsWith('${import.meta.env.VITE_API_BASE}')) {
		normalizedUrl = normalizedUrl.replace('${import.meta.env.VITE_API_BASE}', API_BASE)
	}

	if (normalizedUrl.startsWith('undefined/') || normalizedUrl.startsWith('null/')) {
		normalizedUrl = `${API_BASE}/${normalizedUrl.split('/').slice(1).join('/')}`
	}

	if (normalizedUrl.startsWith('/api/') || normalizedUrl.startsWith('/uploads/')) {
		normalizedUrl = `${API_BASE}${normalizedUrl}`
	}

	if (normalizedUrl.startsWith('api/') || normalizedUrl.startsWith('uploads/')) {
		normalizedUrl = `${API_BASE}/${normalizedUrl}`
	}

	return normalizedUrl
}

window.fetch = async (input, init = {}) => {
	const requestUrl = typeof input === 'string' ? input : input?.url || ''
	const resolvedRequestUrl = resolveRequestUrl(requestUrl)
	const finalInput = typeof input === 'string' ? resolvedRequestUrl : input
	const isApiRequest = resolvedRequestUrl.startsWith(`${API_BASE}/api/`)

	const nextInit = { ...init }
	const nextHeaders = new Headers(init?.headers || {})

	if (isApiRequest && !nextHeaders.has('Authorization')) {
		const token = localStorage.getItem('token')
		if (token) {
			nextHeaders.set('Authorization', `Bearer ${token}`)
		}
	}

	nextInit.headers = nextHeaders

	const response = await originalFetch(finalInput, nextInit)

	const isAuthEndpoint =
		resolvedRequestUrl.includes('/api/auth/login') || resolvedRequestUrl.includes('/api/auth/2fa/verify')
	if (response.status === 401 && !isAuthEndpoint) {
		localStorage.removeItem('token')
		localStorage.removeItem('user')

		if (window.location.pathname !== '/login') {
			router.push('/login')
		}
	}

	return response
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
