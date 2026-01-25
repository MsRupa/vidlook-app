import './globals.css'

export const metadata = {
  title: 'VidLook - Watch YouTube & Earn WLD',
  description: 'Watch YouTube videos and earn VIDEO tokens that you can convert to WLD. Powered by Worldcoin.',
  manifest: '/manifest.json',
  icons: {
    icon: 'https://customer-assets.emergentagent.com/job_cabe8d93-16f6-41cd-861e-00383b6adf99/artifacts/mw0v55qa_vidlook-logo.png',
    apple: 'https://customer-assets.emergentagent.com/job_cabe8d93-16f6-41cd-861e-00383b6adf99/artifacts/mw0v55qa_vidlook-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VidLook',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://www.google.com" />
      </head>
      <body className="bg-black text-white antialiased overflow-x-hidden">
        <div className="max-w-md mx-auto min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  )
}
