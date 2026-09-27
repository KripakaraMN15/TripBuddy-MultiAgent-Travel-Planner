function getApiBaseUrl() {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '')
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return window.location.origin.replace(/\/$/, '')
    }
    return 'http://127.0.0.1:8000'
}

async function request(path, options = {}) {
    const primaryUrl = getApiBaseUrl()
    const targetUrl = `${primaryUrl}${path}`

    try {
        const response = await fetch(targetUrl, {
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
    } catch (err) {
        // If on localhost and primaryUrl was external (e.g. Render production URL in env), try local fallback http://127.0.0.1:8000
        if (
            typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
            !primaryUrl.includes('127.0.0.1') &&
            !primaryUrl.includes('localhost')
        ) {
            try {
                const fallbackUrl = `http://127.0.0.1:8000${path}`
                const fallbackResponse = await fetch(fallbackUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(options.headers || {}),
                    },
                    ...options,
                })
                const fallbackData = await fallbackResponse.json().catch(() => ({}))
                if (fallbackResponse.ok && fallbackData.success !== false) {
                    return fallbackData
                }
            } catch (fallbackErr) {
                // Ignore fallback error
            }
        }

        if (err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
            throw new Error(
                'Unable to reach the TripBuddy AI backend. If using Render free tier, the backend server may be spinning up (takes 30-60s on cold start). If running locally, ensure app.py is running on http://127.0.0.1:8000.'
            )
        }
        throw err
    }
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
