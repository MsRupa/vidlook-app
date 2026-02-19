import './globals.css'
import Script from 'next/script'
import { MiniKitProvider } from '@/components/MiniKitProvider'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'VidLook - Watch YouTube & Earn WLD',
  description: 'Watch YouTube videos and earn VIDEO tokens that you can convert to WLD. Powered by Worldcoin.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JX2DBW24CW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JX2DBW24CW');
          `}
        </Script>
      </head>
      <body className="bg-black text-white antialiased overflow-x-hidden">
        <MiniKitProvider>
          <div className="max-w-md mx-auto min-h-screen relative">
            {children}
          </div>
          <Toaster position="top-center" richColors />
        </MiniKitProvider>
        
        {/* Oculus Analytics for World Mini Apps - must be at end of body */}
        <Script src="https://oculus-sdk.humanlabs.world" strategy="afterInteractive" />
        <Script id="oculus-init" strategy="afterInteractive">
          {`
            window.oculusLayer = window.oculusLayer || [];
            function oculus() { oculusLayer.push(arguments); }
            oculus("app_id", "${process.env.NEXT_PUBLIC_APP_ID}");
          `}
        </Script>
      </body>
    </html>
  )
}
