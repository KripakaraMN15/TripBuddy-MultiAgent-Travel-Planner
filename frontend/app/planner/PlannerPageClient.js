'use client'

import { Suspense } from 'react'
import { PlannerPage } from '../../src/legacy-pages/PlannerPage'

export default function PlannerPageClient() {
    return (
        <Suspense fallback={null}>
            <PlannerPage />
        </Suspense>
    )
}
