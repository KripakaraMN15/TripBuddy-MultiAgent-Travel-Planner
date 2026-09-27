'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, ChevronDown, Minus, Plus, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

const workflowStages = [
    'Request',
    'Guardrails',
    'Supervisor',
    'Specialists',
    'Live tools',
    'Human review',
    'Final plan',
]

export function Hero() {
    const router = useRouter()
    const [origin, setOrigin] = useState('')
    const [destination, setDestination] = useState('')
    const [departureDate, setDepartureDate] = useState('')
    const [returnDate, setReturnDate] = useState('')
    const [travelers, setTravelers] = useState(2)
    const [showTravelerPicker, setShowTravelerPicker] = useState(false)
    const [error, setError] = useState('')
    const [today, setToday] = useState('')

    useEffect(() => {
        setToday(new Date().toISOString().split('T')[0])
    }, [])

    function handleSearch(event) {
        event.preventDefault()
        setError('')

        const cleanOrigin = origin.trim()
        const cleanDestination = destination.trim()
        const currentDate = new Date().toISOString().split('T')[0]

        if (cleanOrigin && cleanDestination && cleanOrigin.toLowerCase() === cleanDestination.toLowerCase()) {
            setError('Origin and destination must be different.')
            return
        }

        if (departureDate && departureDate < currentDate) {
            setError('Departure date cannot be in the past.')
            return
        }

        if (departureDate && returnDate && returnDate < departureDate) {
            setError('Return date must be on or after departure.')
            return
        }

        const travelerLabel = `${travelers} ${travelers === 1 ? 'adult' : 'adults'}`
        let prompt = ''

        if (cleanOrigin && cleanDestination && departureDate && returnDate) {
            const duration = Math.max(
                1,
                Math.round(
                    (new Date(`${returnDate}T00:00:00Z`) - new Date(`${departureDate}T00:00:00Z`)) / 86400000,
                ),
            )
            const formatDate = (value) =>
                new Intl.DateTimeFormat('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC',
                }).format(new Date(`${value}T00:00:00Z`))

            prompt = `Plan a ${duration}-day trip from ${cleanOrigin} to ${cleanDestination} for ${travelerLabel}, from ${formatDate(departureDate)} to ${formatDate(returnDate)}.`
        } else if (cleanOrigin && cleanDestination) {
            prompt = `Plan a trip from ${cleanOrigin} to ${cleanDestination} for ${travelerLabel}.`
        } else if (cleanDestination) {
            prompt = `Plan a trip to ${cleanDestination} for ${travelerLabel}.`
        } else if (cleanOrigin) {
            prompt = `Plan a trip starting from ${cleanOrigin} for ${travelerLabel}.`
        }

        if (prompt) {
            router.push(`/planner?prompt=${encodeURIComponent(prompt)}&autoSubmit=true`)
        } else {
            router.push('/planner')
        }
    }

    return (
        <section className="relative min-h-[100svh] overflow-hidden">
            <div
                className="absolute inset-0 scale-105 bg-cover bg-center"
                style={{ backgroundImage: "url('/hero-escape.jpg')" }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 bg-gradient-to-b from-[#f6e9d8]/35 via-transparent to-[#f4efe8]"
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,248,240,0.18),transparent_55%)]"
                aria-hidden="true"
            />

            <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-4 pb-28 pt-28 text-center sm:px-6 lg:px-8">
                <motion.h1
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="max-w-3xl text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--ink)] sm:text-6xl lg:text-[4.25rem]"
                >
                    The best place to plan your{' '}
                    <span className="font-serif italic font-medium text-[var(--accent)]">next escape</span>.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut', delay: 0.16 }}
                    className="mt-5 max-w-xl text-base leading-7 text-white sm:text-lg"
                >
                    Feeling ready to explore? Tell TripBuddy where you want to go — our agents handle flights,
                    stays, weather, and your day-by-day plan.
                </motion.p>

                <motion.form
                    onSubmit={handleSearch}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.24 }}
                    className="mt-9 w-full max-w-4xl rounded-[28px] border border-white/75 bg-white/90 p-3 text-left shadow-[0_18px_50px_rgba(40,30,20,0.16)] backdrop-blur-xl sm:p-4"
                >
                    <div className="grid gap-2 sm:grid-cols-2">
                        <label className="field-shell">
                            <span className="field-label">From</span>
                            <input
                                type="text"
                                value={origin}
                                onChange={(event) => setOrigin(event.target.value)}
                                placeholder="Bengaluru"
                                className="field-input"
                                autoComplete="address-level2"
                            />
                        </label>
                        <label className="field-shell">
                            <span className="field-label">Destination</span>
                            <input
                                type="text"
                                value={destination}
                                onChange={(event) => setDestination(event.target.value)}
                                placeholder="Goa"
                                className="field-input"
                                autoComplete="off"
                            />
                        </label>
                    </div>

                    <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_0.9fr_auto]">
                        <label className="field-shell">
                            <span className="field-label flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Departure</span>
                            <input
                                type="date"
                                value={departureDate}
                                min={today || undefined}
                                onChange={(event) => setDepartureDate(event.target.value)}
                                className="field-input"
                            />
                        </label>
                        <label className="field-shell">
                            <span className="field-label flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Return</span>
                            <input
                                type="date"
                                value={returnDate}
                                min={departureDate || today || undefined}
                                onChange={(event) => setReturnDate(event.target.value)}
                                className="field-input"
                            />
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowTravelerPicker((visible) => !visible)}
                                className="field-shell flex w-full cursor-pointer items-center justify-between text-left"
                                aria-expanded={showTravelerPicker}
                                aria-haspopup="dialog"
                            >
                                <span>
                                    <span className="field-label flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Travelers</span>
                                    <span className="field-value">{travelers} {travelers === 1 ? 'Adult' : 'Adults'}</span>
                                </span>
                                <ChevronDown className={`h-4 w-4 text-[var(--muted)] transition-transform ${showTravelerPicker ? 'rotate-180' : ''}`} />
                            </button>
                            {showTravelerPicker && (
                                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[0_18px_40px_rgba(40,30,20,0.16)] sm:min-w-[190px]">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-semibold text-[var(--ink)]">Adults</span>
                                        <span className="flex items-center gap-2">
                                            <button type="button" onClick={() => setTravelers((count) => Math.max(1, count - 1))} className="count-button" aria-label="Decrease adults"><Minus className="h-3.5 w-3.5" /></button>
                                            <span className="w-5 text-center text-sm font-bold text-[var(--ink)]">{travelers}</span>
                                            <button type="button" onClick={() => setTravelers((count) => count + 1)} className="count-button" aria-label="Increase adults"><Plus className="h-3.5 w-3.5" /></button>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button type="submit" className="btn-ink min-h-14 rounded-2xl px-6 text-sm font-semibold sm:rounded-full">
                            Plan Now
                        </button>
                    </div>
                    {error && <p className="mt-3 px-1 text-xs font-semibold text-[#a64b3c]" role="alert">{error}</p>}
                </motion.form>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4 }}
                    className="absolute bottom-8 left-0 right-0 px-4"
                >
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Built around a 7-stage agentic workflow
                    </p>
                    <a
                        href="#how-it-works"
                        className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-1.5"
                        aria-label="See the 7-stage agentic workflow"
                    >
                        {workflowStages.map((stage, index) => (
                            <span key={stage} className="contents">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-white/55 px-2.5 py-1 text-[11px] font-semibold text-[var(--ink-soft)] backdrop-blur-md transition hover:bg-white/80 sm:text-xs">
                                    <span className="font-serif italic text-[var(--accent)]">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    {stage}
                                </span>
                                {index < workflowStages.length - 1 && (
                                    <span className="hidden text-[var(--muted)] sm:inline" aria-hidden="true">
                                        →
                                    </span>
                                )}
                            </span>
                        ))}
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
