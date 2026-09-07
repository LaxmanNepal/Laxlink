import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'LaxLink — Smart Links & Analytics', description: 'Short links, deep routing, QR codes and analytics in one full-stack platform.', metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html> }
