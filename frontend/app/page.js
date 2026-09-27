import { LandingPage } from '../src/screens/LandingPage'
import { buildJsonLd, buildMetadata } from '../src/lib/metadata'

export const metadata = buildMetadata({
  title: 'TripBuddy AI',
  description:
    'Plan calmer trips with TripBuddy AI - a multi-agent travel planner for flights, hotels, weather, budgets, and reviewable itineraries.',
  path: '/',
})

export default function Page() {
  return <LandingPage jsonLd={buildJsonLd()} />
}
