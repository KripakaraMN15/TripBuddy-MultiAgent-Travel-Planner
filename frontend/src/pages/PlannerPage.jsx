import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download, Loader2, MessageSquareText, Sparkles, X } from 'lucide-react'
import { marked } from 'marked'
import { useLocation } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { submitApproval, submitTravelRequest } from '../services/api'

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
    const location = useLocation()
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [threadId, setThreadId] = useState(() => localStorage.getItem('travel_thread_id') || '')
    const [workflow, setWorkflow] = useState(null)
    const [result, setResult] = useState('')
    const [resultTitle, setResultTitle] = useState('Draft Travel Plan')
    const [showApproval, setShowApproval] = useState(false)
    const [approvalRequest, setApprovalRequest] = useState('')
    const [approvalFeedback, setApprovalFeedback] = useState('')
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const promptList = useMemo(() => starterPrompts, [])

    useEffect(() => {
        const prompt = location.state?.prompt
        if (typeof prompt === 'string' && prompt.trim()) {
            setInput(prompt.trim())
        }
    }, [location.state])

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')

        const trimmed = input.trim()
        if (!trimmed) {
            setError('Please enter your travel request first.')
            return
        }

        if (trimmed.length < 10) {
            setError('Please provide a bit more detail so the planner can generate a useful trip suggestion.')
            return
        }

        setIsLoading(true)

        try {
            const response = await submitTravelRequest(trimmed, threadId || null)

            if (response.thread_id) {
                setThreadId(response.thread_id)
                localStorage.setItem('travel_thread_id', response.thread_id)
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
            setError(err.message || 'Something went wrong while contacting the API.')
        } finally {
            setIsLoading(false)
        }
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
            setError(err.message || 'Could not resume the travel workflow.')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCopy() {
        if (!result) return
        try {
            await navigator.clipboard.writeText(result.replace(/<[^>]*>/g, ''))
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
        } catch {
            setCopied(false)
        }
    }

    function handleDownload() {
        if (!result) return
        const blob = new Blob([result.replace(/<[^>]*>/g, '')], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'trip-plan.txt'
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
            <Seo
                title="Plan a trip"
                description="Describe your trip and TripBuddy AI will research flights, hotels, weather, and budget before you approve a polished itinerary."
                path="/planner"
            />
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
                                    {promptList.map((prompt) => (
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
                        {workflow && (
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
                                className="prose max-w-none rounded-[22px] border border-[var(--line)] bg-[var(--sand)]/55 p-4 text-sm leading-7 text-[var(--ink-soft)]"
                                dangerouslySetInnerHTML={{
                                    __html: marked.parse(result || 'Your generated itinerary will appear here.'),
                                }}
                            />
                        </motion.div>

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
