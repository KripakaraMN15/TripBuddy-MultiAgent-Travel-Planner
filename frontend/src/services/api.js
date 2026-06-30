const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || data.success === false) {
        const errorMessage = data.error || 'Something went wrong while contacting the TripBuddy AI API.'
        throw new Error(errorMessage)
    }

    return data
}

export async function submitTravelRequest(message, threadId = null) {
    return request('/api/travel', {
        method: 'POST',
        body: JSON.stringify({
            message,
            thread_id: threadId || null,
        }),
    })
}

export async function submitApproval(threadId, approved, feedback = '') {
    return request('/api/travel/approve', {
        method: 'POST',
        body: JSON.stringify({
            thread_id: threadId,
            approved,
            feedback,
        }),
    })
}

export async function checkHealth() {
    return request('/health', { method: 'GET' })
}
