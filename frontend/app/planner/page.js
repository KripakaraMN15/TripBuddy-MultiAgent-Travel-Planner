import PlannerPageClient from './PlannerPageClient'
import { buildMetadata } from '../../src/lib/metadata'

export const metadata = buildMetadata({
  title: 'Plan a trip',
  description:
    'Describe your trip and TripBuddy AI will research flights, hotels, weather, and budget before you approve a polished itinerary.',
  path: '/planner',
})

export default function Page() {
  return <PlannerPageClient />
}
