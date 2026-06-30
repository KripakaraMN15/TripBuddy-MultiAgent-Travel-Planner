import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download, Loader2, MessageSquareText, Sparkles, X } from 'lucide-react'
import { marked } from 'marked'
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

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')

        if (!input.trim()) {
            setError('Please enter your travel request first.')
            return
        }

        setIsLoading(true)

        try {
            const response = await submitTravelRequest(input.trim(), threadId || null)

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
        <main className="min-h-screen bg-[#f8f4ee] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c66d3f]">Trip planner</p>
                        <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-slate-950">Plan smarter. Travel better.</h1>
                    </div>
                    {threadId && (
                        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                            Thread: {threadId}
                        </div>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f3e3d3] text-[#8a5a3b]">
                                <MessageSquareText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Travel request</p>
                                <h2 className="text-xl font-black tracking-[-0.05em] text-slate-900">Describe your trip</h2>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <textarea
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                rows={8}
                                className="w-full rounded-[22px] border border-slate-200 bg-[#faf8f6] p-4 text-base text-slate-800 outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#d9b799]"
                                placeholder="Example: Plan a 7-day Tokyo trip from Bengaluru with a mid-range budget, great food recommendations, and safe nightlife options."
                            />

                            <div className="space-y-3">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Sample prompts</p>
                                <div className="flex flex-wrap gap-2">
                                    {promptList.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => setInput(prompt)}
                                            className="rounded-full border border-slate-200 bg-[#f7f4f1] px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#d9b799] hover:text-slate-950"
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
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
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
                                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6"
                            >
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Workflow</p>
                                        <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-900">Supervisor reasoning</h3>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${workflow.guardrail_allowed === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {workflow.guardrail_allowed === false ? 'Guardrail blocked' : 'Guardrail passed'}
                                    </span>
                                </div>

                                <p className="rounded-2xl bg-[#fbf8f5] p-4 text-sm leading-6 text-slate-700">
                                    {workflow.supervisor_reasoning}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {(workflow.selected_agents || []).map((agent) => (
                                        <span
                                            key={agent}
                                            className="rounded-full border border-[#ead9c6] bg-[#f7efe8] px-2.5 py-1.5 text-xs font-bold text-[#8a5a3b]"
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
                            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6"
                        >
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-2xl font-black tracking-[-0.05em] text-slate-900">{resultTitle}</h3>
                                {result && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCopy}
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                                        >
                                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Download
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div
                                className="prose max-w-none rounded-[22px] border border-slate-200 bg-[#f9f6f3] p-4 text-sm leading-7 text-slate-700"
                                dangerouslySetInnerHTML={{ __html: marked.parse(result || 'Your generated itinerary will appear here.') }}
                            />
                        </motion.div>

                        {showApproval && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-[28px] border border-[#ead9c6] bg-[#fbf5f0] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.04)] sm:p-6"
                            >
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f3e3d3] text-[#8a5a3b]">
                                        <Check className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9d6a4b]">Human review</p>
                                        <h3 className="text-xl font-black tracking-[-0.05em] text-slate-900">Approve this draft</h3>
                                    </div>
                                </div>

                                <p className="mb-4 rounded-2xl bg-white p-3 text-sm text-slate-700">{approvalRequest}</p>

                                <textarea
                                    value={approvalFeedback}
                                    onChange={(event) => setApprovalFeedback(event.target.value)}
                                    rows={4}
                                    className="w-full rounded-[20px] border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#d9b799]"
                                    placeholder="Optional revision feedback..."
                                />

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleApproval(true)}
                                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
                                    >
                                        <Check className="h-4 w-4" />
                                        Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApproval(false)}
                                        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
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
