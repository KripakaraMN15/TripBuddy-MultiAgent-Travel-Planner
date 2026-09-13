import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { Seo } from '../components/Seo'

export function NotFoundPage() {
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <Seo
        title="Page not found"
        description="This TripBuddy page does not exist. Head home or open the trip planner to continue."
        path="/404"
      />

      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
          <Compass className="h-6 w-6 text-[var(--accent)]" strokeWidth={1.7} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">404</p>
        <h1 className="mt-3 font-serif text-4xl italic text-[var(--ink)] sm:text-5xl">
          This path leads nowhere.
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          The page you requested is not part of TripBuddy. Return home or start planning your next escape.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-ink inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5"
          >
            Plan a trip
          </Link>
        </div>
      </div>
    </main>
  )
}
