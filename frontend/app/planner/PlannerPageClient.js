'use client'

import { PlannerPage } from '../../src/screens/PlannerPage'

// No Suspense boundary here on purpose. Nothing in this subtree suspends, and
// wrapping it in <Suspense fallback={null}> is what allowed the exported
// planner.html to ship an empty page: any future bailout would silently blank
// the UI again instead of failing the build.
export default function PlannerPageClient() {
    return <PlannerPage />
}
