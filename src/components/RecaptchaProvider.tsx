'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Script from 'next/script';

interface RecaptchaContextType {
  executeRecaptcha: (action: string) => Promise<string | null>;
  isLoaded: boolean;
}

const RecaptchaContext = createContext<RecaptchaContextType>({
  executeRecaptcha: async () => null,
  isLoaded: false,
});

export const useRecaptcha = () => useContext(RecaptchaContext);

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

export default function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (!isLoaded || !window.grecaptcha || !siteKey) {
      console.warn('reCAPTCHA not loaded or site key missing');
      return null;
    }

    try {
      const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  };

  const handleScriptLoad = () => {
    if (window.grecaptcha && siteKey) {
      window.grecaptcha.enterprise.ready(() => {
        setIsLoaded(true);
      });
    }
  };

  if (!siteKey) {
    console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured');
    return <>{children}</>;
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`}
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      <RecaptchaContext.Provider value={{ executeRecaptcha, isLoaded }}>
        {children}
      </RecaptchaContext.Provider>
    </>
  );
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}
