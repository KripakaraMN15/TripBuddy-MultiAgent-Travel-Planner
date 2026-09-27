import { TermsPage } from '../../src/screens/TermsPage'
import { buildMetadata } from '../../src/lib/metadata'

export const metadata = buildMetadata({
  title: 'Terms & Conditions',
  description:
    'Read the TripBuddy AI terms covering use of the travel planner, service limitations, and user responsibilities.',
  path: '/terms',
})

export default function Page() {
  return <TermsPage />
}
