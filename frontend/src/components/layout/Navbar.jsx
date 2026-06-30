import { Link, NavLink } from 'react-router-dom'
import { PlaneTakeoff } from 'lucide-react'

const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Plan a Trip', to: '/planner' },
]

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f5efe8]/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-3 text-slate-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3e3d3] text-[#c66d3f] ring-1 ring-[#d9b799]">
                        <PlaneTakeoff className="h-4 w-4" />
                    </span>
                    <span className="text-lg font-extrabold tracking-[-0.04em]">TripBuddy AI</span>
                </Link>

                <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.to}
                            className={({ isActive }) =>
                                `transition-colors ${isActive ? 'text-slate-900' : 'hover:text-slate-900'}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <Link
                    to="/planner"
                    className="hidden rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.15)] transition hover:-translate-y-0.5 md:inline-flex"
                >
                    Start Planning
                </Link>
            </div>
        </header>
    )
}
