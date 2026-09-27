const LOCAL_API_BASE = 'http://127.0.0.1:8000'

// A full graph run can take a while on a cold start, so the ceiling is generous.
const DEFAULT_TIMEOUT_MS = 180000

const COLD_START_MESSAGE =
    'Unable to reach the TripBuddy AI backend. On a free-tier host the server may be spinning up, which can take 30-60s on a cold start. If you are running locally, make sure app.py is serving on http://127.0.0.1:8000.'

function isLocalhost() {
    return (
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1')
    )
}

function getApiBaseUrl() {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '')
    }
    // Deployed: the static host and API share an origin.
    if (typeof window !== 'undefined' && !isLocalhost()) {
        return window.location.origin.replace(/\/$/, '')
    }
    return LOCAL_API_BASE
}

async function fetchJson(url, options, timeoutMs) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    // Let a caller-supplied signal cancel the request early without losing the
    // timeout guarantee.
    const externalSignal = options.signal
    const forwardAbort = () => controller.abort()
    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort()
        } else {
            externalSignal.addEventListener('abort', forwardAbort, { once: true })
        }
    }

    try {
        const response = await fetch(url, { ...options, signal: controller.signal })
        const data = await response.json().catch(() => ({}))
        return { response, data }
    } finally {
        clearTimeout(timer)
        if (externalSignal) {
            externalSignal.removeEventListener('abort', forwardAbort)
        }
    }
}

async function request(path, options = {}) {
    const { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS } = options
    const primaryUrl = getApiBaseUrl()

    const init = {
        method,
        // Spread first so a caller-supplied headers object can override rather
        // than be clobbered by the default Content-Type.
        ...options,
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            Accept: 'application/json',
            ...(options.headers || {}),
        },
    }
    if (body !== undefined) {
        init.body = body
    }

    try {
        const { response, data } = await fetchJson(
            `${primaryUrl}${path}`,
            init,
            timeoutMs
        )

        if (!response.ok || data.success === false) {
            throw new Error(
                data.error || 'Something went wrong while contacting the TripBuddy AI API.'
            )
        }

        return data
    } catch (err) {
        // On localhost, an external base URL leaking in from .env is a common
        // misconfiguration, so retry against the local backend once.
        if (
            isLocalhost() &&
            !primaryUrl.includes('127.0.0.1') &&
            !primaryUrl.includes('localhost') &&
            !err.name?.startsWith('Abort')
        ) {
            try {
                const { response, data } = await fetchJson(
                    `${LOCAL_API_BASE}${path}`,
                    init,
                    timeoutMs
                )
                if (response.ok && data.success !== false) {
                    return data
                }
            } catch {
                // Fall through to the shared error handling below.
            }
        }

        if (err.name === 'AbortError') {
            throw new Error(
                'The request timed out. Planning a trip can take a minute — please try again.'
            )
        }
        if (
            err.name === 'TypeError' ||
            (err.message && err.message.includes('Failed to fetch'))
        ) {
            throw new Error(COLD_START_MESSAGE)
        }
        throw err
    }
}

export async function submitTravelRequest(message, threadId = null, options = {}) {
    return request(
        '/api/travel',
        {
            method: 'POST',
            body: JSON.stringify({ message, thread_id: threadId || null }),
            ...options,
        }
    )
}

export async function submitApproval(threadId, approved, feedback = '', options = {}) {
    return request(
        '/api/travel/approve',
        {
            method: 'POST',
            body: JSON.stringify({
                thread_id: threadId,
                approved,
                feedback,
            }),
            ...options,
        }
    )
}
