'use client'

import { Suspense } from 'react'
import { PlannerPage } from '../../src/screens/PlannerPage'

export default function PlannerPageClient() {
    return (
        <Suspense fallback={null}>
            <PlannerPage />
        </Suspense>
    )
}
