import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Sign in — GrantQuest',
  description:
    'Sign in to GrantQuest with a one-time email code or Google to sync your scholarship quest log across devices. No passwords.',
}

export default function LoginLayout({children}: {children: React.ReactNode}) {
  return children
}
