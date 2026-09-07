import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LaxLink — Smart Links & Analytics',
  description: 'Create, manage and analyze smart links with LaxLink.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}