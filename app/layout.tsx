import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import { LanguageProvider } from "@/lib/i18n"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "QR Code Generator",
  description: "Generate QR codes from URLs",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
