export function TripPreview() {
    return (
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 max-w-2xl">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#c66d3f]">Trip preview</p>
                    <h2 className="text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">A polished final plan, ready for review.</h2>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.05)] sm:p-8">
                    <div className="rounded-[20px] border border-slate-200 bg-[#f9f4ef] p-5 sm:p-8">
                        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Tokyo, Japan</p>
                                <h3 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-950">7 days · from India</h3>
                                <p className="mt-2 text-sm text-slate-500">A considered route through Tokyo's food, neighborhoods, and quiet corners.</p>
                            </div>
                            <div className="rounded-full bg-[#f0e2d2] px-3 py-1.5 text-sm font-bold text-[#885a3a]">Estimated total ₹64,000</div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {[
                                ['Flights', '₹32,400'],
                                ['Hotels', '₹18,600'],
                                ['Food & transport', '₹13,000'],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
                                    <p className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-slate-900">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Day 03</p>
                            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
                                <h4 className="text-xl font-black tracking-[-0.04em] text-slate-900">Shibuya • Harajuku • Shinjuku</h4>
                                <p className="mt-2 text-sm text-slate-600">A full day of neighborhoods, food, and city highlights designed around your travel rhythm and budget.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
