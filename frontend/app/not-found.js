import { NotFoundPage } from '../src/screens/NotFoundPage'
import { buildMetadata } from '../src/lib/metadata'

export const metadata = buildMetadata({
  title: 'Page not found',
  description:
    'This TripBuddy page does not exist. Head home or open the trip planner to continue.',
  path: '/404',
})

export default function NotFound() {
  return <NotFoundPage />
}
