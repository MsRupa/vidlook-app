'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

// Create context for MiniKit state
const MiniKitContext = createContext({ isInstalled: false, isReady: false });

export function MiniKitProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Install MiniKit - this is synchronous
    MiniKit.install(process.env.NEXT_PUBLIC_APP_ID);
    
    // Check if installed after a short delay to allow World App to inject
    const timer = setTimeout(() => {
      setIsInstalled(MiniKit.isInstalled());
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Always render children - don't block rendering
  return (
    <MiniKitContext.Provider value={{ isInstalled, isReady }}>
      {children}
    </MiniKitContext.Provider>
  );
}

// Hook to check if MiniKit is installed (running inside World App)
export function useMiniKit() {
  const context = useContext(MiniKitContext);
  
  return { 
    isInstalled: context.isInstalled, 
    isChecking: !context.isReady 
  };
}
