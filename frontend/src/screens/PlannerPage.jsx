'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download, Loader2, MessageSquareText, Sparkles, X } from 'lucide-react'
import { Marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { TripPlanningLoader } from '../components/planner/TripPlanningLoader'
import { checkThreadState, submitApproval, submitTravelRequest } from '../services/api'

// marked v5+ changed parse() to be async by default.
// Use a synchronous Marked instance to keep rendering simple and reliable.
const markedSync = new Marked({ async: false })

const starterPrompts = [
    'Plan a 7-day Tokyo trip from Bengaluru with mid-range budget and a strong food focus.',
    'Create a 5-day Bali itinerary with beach hotels, flights, and rain-safe plan.',
    'Build a 4-day Paris trip for a couple with budget-conscious shopping and museum visits.',
]

const AGENT_LABELS = {
    flight_agent: '✈️ Flight Agent',
    hotel_agent: '🏨 Hotel Agent',
    weather_agent: '🌦️ Weather Agent',
    budget_agent: '💰 Budget Agent',
    itinerary_agent: '🗓️ Itinerary Agent',
}

export function PlannerPage() {
    // The ?prompt= value is read after mount rather than through
    // useSearchParams(). That hook forces Next.js to bail out of static
    // prerendering for this whole subtree, and the enclosing Suspense fallback
    // is null, so the exported planner.html shipped an empty <main> that only
    // appeared once JavaScript hydrated. Reading window.location.search in an
    // effect keeps the first client render identical to the prerendered HTML
    // (no hydration mismatch) while still filling the field on arrival.
    const [promptParam, setPromptParam] = useState('')

    useEffect(() => {
        const fromUrl = new URLSearchParams(window.location.search).get('prompt')?.trim() || ''
        if (fromUrl) {
            setPromptParam(fromUrl)
        }
    }, [])

    const [input, setInput] = useState(promptParam)
    const [isLoading, setIsLoading] = useState(false)
    const [threadId, setThreadId] = useState('')
    const [workflow, setWorkflow] = useState(null)
    const [result, setResult] = useState('')
    const [resultTitle, setResultTitle] = useState('Draft Travel Plan')
    const [showApproval, setShowApproval] = useState(false)
    const [approvalRequest, setApprovalRequest] = useState('')
    const [approvalFeedback, setApprovalFeedback] = useState('')
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const abortRef = useRef(null)

    // Keep the textarea in step with the ?prompt= query param without an effect,
    // so typing is never clobbered by a re-render.
    const [lastPrompt, setLastPrompt] = useState(promptParam)
    if (promptParam !== lastPrompt) {
        setLastPrompt(promptParam)
        setInput(promptParam)
    }

    // markedSync.parse() is synchronous, so this needs no state or effect.
    // Sanitising before injection is what keeps model output from becoming XSS.
    const renderedHtml = useMemo(() => {
        const raw = markedSync.parse(result || 'Your generated itinerary will appear here.')
        return sanitizeHtml(typeof raw === 'string' ? raw : String(raw), {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'img']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                '*': ['class'],
            },
        })
    }, [result])

    // Restore a thread that is still awaiting review after a page refresh.
    // The stored id goes stale whenever the backend loses its checkpoints (a
    // restart, a free-tier spin-down, or the in-memory store), so it has to be
    // verified before it is trusted. A normal browser keeps the id while
    // incognito starts empty, which is why only one of the two worked.
    useEffect(() => {
        const savedThreadId = window.localStorage.getItem('travel_thread_id')
        if (!savedThreadId) {
            return
        }

        let cancelled = false

        async function verify() {
            let state = await checkThreadState(savedThreadId)

            // A cold backend can exceed the request timeout on the first try.
            // One retry distinguishes a slow start from a genuinely lost
            // thread, which matters because the two need opposite handling.
            if (!state) {
                await new Promise((resolve) => setTimeout(resolve, 2500))
                state = await checkThreadState(savedThreadId)
            }

            if (cancelled) {
                return
            }

            if (state?.awaiting_approval) {
                setThreadId(savedThreadId)
                setShowApproval(true)
                setResultTitle('Draft Travel Plan')
                setResult(
                    'A draft from your previous session is still waiting for review. Approve it to generate the final plan, or describe a new trip below.'
                )
                setApprovalRequest(
                    'Approve the draft or provide feedback before the final plan is generated.'
                )
                return
            }

            if (state) {
                // The backend answered, and the thread is not waiting for
                // review: either it never existed or it was already approved.
                // Either way there is nothing left to resume.
                window.localStorage.removeItem('travel_thread_id')
                return
            }

            // The backend could not be reached, so the thread's fate is
            // unknown. Deleting the id here would throw away a draft that is
            // still resumable, so it is kept and the approve path clears it
            // if it turns out to be gone.
            setError(
                'Could not reach the planning service to check your saved draft. It has been kept, so you can describe your trip again if it no longer resumes.'
            )
        }

        verify()

        return () => {
            cancelled = true
        }
    }, [])

    const runPlanning = useCallback(async () => {
        const trimmed = input.trim()

        if (!trimmed) {
            setError('Please enter your travel request first.')
            return
        }

        if (trimmed.length < 10) {
            setError('Please provide a bit more detail so the planner can generate a useful trip suggestion.')
            return
        }

        setError('')
        setIsLoading(true)
        setWorkflow(null)
        setResult('')
        setShowApproval(false)
        setThreadId('')
        window.localStorage.removeItem('travel_thread_id')

        const controller = new AbortController()
        abortRef.current = controller

        setTimeout(() => {
            document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 50)

        try {
            const response = await submitTravelRequest(trimmed, null, {
                signal: controller.signal,
            })

            if (response.thread_id) {
                setThreadId(response.thread_id)
                window.localStorage.setItem('travel_thread_id', response.thread_id)
            }

            setWorkflow({
                supervisor_reasoning: response.supervisor_reasoning || 'Supervisor routing completed.',
                selected_agents: response.selected_agents || [],
                guardrail_allowed: response.guardrail_allowed !== false,
            })

            if (response.requires_approval) {
                setResultTitle('Draft Travel Plan')
                setResult(response.itinerary || response.answer || '')
                setApprovalRequest(
                    response.approval_request || 'Approve the draft or provide feedback before the final plan is generated.',
                )
                setShowApproval(true)
            } else {
                setResultTitle('Your Final AI Travel Plan')
                setResult(response.answer || '')
                setShowApproval(false)
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                return
            }
            setError(
                err.message ||
                'Unable to reach the TripBuddy AI backend. If you are running locally, make sure the FastAPI server is running on http://127.0.0.1:8000.'
            )
        } finally {
            if (abortRef.current === controller) {
                abortRef.current = null
            }
            setIsLoading(false)
        }
    }, [input])

    // Abandon an in-flight request if the user navigates away.
    useEffect(() => {
        return () => {
            abortRef.current?.abort()
        }
    }, [])

    async function handleSubmit(event) {
        event.preventDefault()
        await runPlanning()
    }

    async function handleApproval(approved) {
        if (!threadId) {
            setError('There is no draft waiting for approval.')
            return
        }

        if (!approved && !approvalFeedback.trim()) {
            setError('Please enter revision feedback before requesting changes.')
            return
        }

        setIsLoading(true)
        setError('')

        setTimeout(() => {
            document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 50)

        try {
            const response = await submitApproval(threadId, approved, approvalFeedback)
            setWorkflow({
                supervisor_reasoning: response.supervisor_reasoning || 'Supervisor routing completed.',
                selected_agents: response.selected_agents || [],
                guardrail_allowed: response.guardrail_allowed !== false,
            })
            setResultTitle('Your Final AI Travel Plan')
            setResult(response.answer || '')
            setShowApproval(false)
            setApprovalFeedback('')
        } catch (err) {
            // A dead thread id is the most common failure here (the backend lost
            // its checkpoints). Clear it so the next attempt is not retried
            // against the same expired id.
            window.localStorage.removeItem('travel_thread_id')
            setThreadId('')
            setShowApproval(false)
            setError(
                err.message ||
                'Could not resume the travel workflow. Please describe your trip again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCopy() {
        if (!result) return
        try {
            // `result` is raw markdown, so it is copied verbatim.
            await navigator.clipboard.writeText(result)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
        } catch {
            setCopied(false)
        }
    }

    function handleDownload() {
        if (!result) return
        const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'trip-plan.md'
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-cover bg-center opacity-30"
                style={{ backgroundImage: "url('/hero-escape.jpg')" }}
                aria-hidden="true"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[var(--sand)]/40 via-[var(--sand)]/85 to-[var(--sand)]" aria-hidden="true" />

            <div className="relative mx-auto max-w-6xl">
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            Trip planner
                        </p>
                        <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-[var(--ink)] sm:text-5xl">
                            Plan smarter.{' '}
                            <span className="font-serif italic font-medium text-[var(--accent)]">Travel calmer.</span>
                        </h1>
                    </div>
                    {threadId && (
                        <div className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 text-xs font-medium text-[var(--muted)] backdrop-blur-sm">
                            Thread: {threadId.slice(0, 18)}…
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                    <section className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(40,30,20,0.08)] backdrop-blur-xl sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sand)] text-[var(--ink)] ring-1 ring-black/5">
                                <MessageSquareText className="h-5 w-5" strokeWidth={1.7} />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                    Travel request
                                </p>
                                <h2 className="text-xl font-bold tracking-[-0.03em] text-[var(--ink)]">
                                    Describe your trip
                                </h2>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <textarea
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                rows={8}
                                maxLength={5000}
                                className="w-full rounded-[24px] border border-[var(--line)] bg-[var(--sand)]/60 p-4 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent-soft)] focus:bg-white"
                                placeholder="Example: Plan a 7-day Tokyo trip from Bengaluru with a mid-range budget, great food recommendations, and safe nightlife options."
                                aria-label="Describe your trip"
                            />
                            <div className="text-right text-xs text-[var(--muted)]">{input.length}/5000</div>

                            <div className="space-y-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                    Sample prompts
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {starterPrompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => setInput(prompt)}
                                            className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--accent-soft)] hover:text-[var(--ink)]"
                                        >
                                            {prompt.slice(0, 32)}...
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    <X className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-ink inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                {isLoading ? 'Planning your trip…' : 'Generate travel plan'}
                            </button>
                        </form>
                    </section>

                    <section className="space-y-6">
                        {isLoading ? (
                            <motion.div
                                id="result"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(40,30,20,0.08)] backdrop-blur-xl sm:p-6"
                            >
                                <TripPlanningLoader />
                            </motion.div>
                        ) : (
                            <>
                                {workflow && result && (
                                    <motion.div
                                        id="workflow"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(40,30,20,0.08)] backdrop-blur-xl sm:p-6"
                                    >
                                        <div className="mb-4 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                                                    Workflow
                                                </p>
                                                <h3 className="mt-2 font-serif text-3xl italic text-[var(--ink)]">
                                                    Supervisor reasoning
                                                </h3>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold ${workflow.guardrail_allowed === false
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                    }`}
                                            >
                                                {workflow.guardrail_allowed === false ? 'Guardrail blocked' : 'Guardrail passed'}
                                            </span>
                                        </div>

                                        <p className="rounded-2xl bg-[var(--sand)]/70 p-4 text-sm leading-6 text-[var(--ink-soft)]">
                                            {workflow.supervisor_reasoning}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {(workflow.selected_agents || []).map((agent) => (
                                                <span
                                                    key={agent}
                                                    className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1.5 text-xs font-bold text-[var(--ink-soft)]"
                                                >
                                                    {AGENT_LABELS[agent] || agent}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <motion.div
                                    id="result"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(40,30,20,0.08)] backdrop-blur-xl sm:p-6"
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h3 className="font-serif text-3xl italic text-[var(--ink)]">{resultTitle}</h3>
                                        {result && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleCopy}
                                                    className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink-soft)]"
                                                >
                                                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                    {copied ? 'Copied' : 'Copy'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleDownload}
                                                    className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink-soft)]"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Download
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className="prose itinerary-content max-w-none rounded-[22px] border border-[var(--line)] bg-[var(--sand)]/55 p-4 text-sm leading-7 text-[var(--ink-soft)]"
                                        dangerouslySetInnerHTML={{ __html: renderedHtml }}
                                    />
                                </motion.div>
                            </>
                        )}

                        {showApproval && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-[30px] border border-[var(--accent-soft)]/40 bg-[#fbf5f0]/95 p-5 shadow-[0_20px_60px_rgba(40,30,20,0.06)] backdrop-blur-xl sm:p-6"
                            >
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--accent)] ring-1 ring-black/5">
                                        <Check className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                                            Human review
                                        </p>
                                        <h3 className="text-xl font-bold tracking-[-0.03em] text-[var(--ink)]">
                                            Approve this draft
                                        </h3>
                                    </div>
                                </div>

                                <p className="mb-4 rounded-2xl bg-white/80 p-3 text-sm text-[var(--ink-soft)]">
                                    {approvalRequest}
                                </p>

                                <textarea
                                    value={approvalFeedback}
                                    onChange={(event) => setApprovalFeedback(event.target.value)}
                                    rows={4}
                                    className="w-full rounded-[20px] border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-soft)]"
                                    placeholder="Optional revision feedback..."
                                />

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleApproval(true)}
                                        className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"
                                    >
                                        <Check className="h-4 w-4" />
                                        Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApproval(false)}
                                        className="inline-flex items-center gap-2 rounded-full bg-[#1c1916] px-4 py-2.5 text-sm font-semibold text-white"
                                    >
                                        <X className="h-4 w-4" />
                                        Revise
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    )
}
