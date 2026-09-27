const LOCAL_API_BASE = 'http://127.0.0.1:8000'

// The static site and the API are separate Render services, so the base URL has
// to be discovered at runtime. `process.env.NEXT_PUBLIC_*` is inlined into the
// bundle at build time, so it cannot be corrected without a rebuild; the
// <meta name="api-base-url"> tag in layout.js is read from the live document
// instead, and a postbuild step can rewrite it in the exported HTML.
const DEPLOYED_API_BASE = 'https://tripbuddy-multiagent-travel-planner.onrender.com'

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
    if (typeof window === 'undefined') {
        return LOCAL_API_BASE
    }

    if (isLocalhost()) {
        return LOCAL_API_BASE
    }

    const injected = document
        .querySelector('meta[name="api-base-url"]')
        ?.content?.trim()
        ?.replace(/\/$/, '')

    // Never let the API base point at the static site: it serves no
    // /api/travel and answering with HTML is what made the planner appear to
    // do nothing. Fall back to the known API service in that case.
    if (!injected || injected === window.location.origin) {
        return DEPLOYED_API_BASE
    }

    return injected
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

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
            // A static host answering with HTML means the request went to the
            // wrong origin. Surface that instead of returning an empty object,
            // which used to look like a successful but empty plan.
            throw new Error(
                `The TripBuddy API did not return JSON from ${url}. ` +
                'The frontend is probably pointed at the static site instead of the API service.'
            )
        }

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

export async function checkThreadState(threadId, options = {}) {
    // Returns { exists, awaiting_approval } or null if the check itself failed.
    try {
        const data = await request(
            `/api/travel/state?thread_id=${encodeURIComponent(threadId)}`,
            { method: 'GET', timeoutMs: 20000, ...options }
        )
        return {
            exists: Boolean(data.exists),
            awaiting_approval: Boolean(data.awaiting_approval),
        }
    } catch {
        return null
    }
}
