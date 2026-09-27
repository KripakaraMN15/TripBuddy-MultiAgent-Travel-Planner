import { PrivacyPolicyPage } from '../../src/screens/PrivacyPolicyPage'
import { buildMetadata } from '../../src/lib/metadata'

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'Learn how TripBuddy AI handles travel requests and the data it stores.',
  path: '/privacy-policy',
})

export default function Page() {
  return <PrivacyPolicyPage />
}
