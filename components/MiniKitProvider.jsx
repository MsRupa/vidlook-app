'use client';

import { useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export function MiniKitProvider({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Install MiniKit
    MiniKit.install(process.env.NEXT_PUBLIC_APP_ID);
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}

// Hook to check if MiniKit is installed (running inside World App)
export function useMiniKit() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give MiniKit time to install before checking
    const timer = setTimeout(() => {
      setIsInstalled(MiniKit.isInstalled());
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { isInstalled, isChecking };
}
