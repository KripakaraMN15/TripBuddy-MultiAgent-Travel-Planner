'use client'

import { Plane } from 'lucide-react'

export function TripPlanningLoader() {
    return (
        <div className="trip-planning-loader" role="status" aria-live="polite">
            <div className="trip-route" aria-hidden="true">
                <span className="trip-route-point trip-route-start" />
                <span className="trip-route-line" />
                <span className="trip-route-plane">
                    <Plane className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span className="trip-route-point trip-route-end" />
            </div>
            <p className="mt-6 font-serif text-2xl italic text-[var(--ink)]">Your trip is taking shape.</p>
            <p className="mt-2 text-sm font-medium text-[var(--ink-soft)]">TripBuddy is packing the details...</p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Almost ready for takeoff.
            </p>
            <span className="sr-only">TripBuddy is preparing your travel plan.</span>
        </div>
    )
}
