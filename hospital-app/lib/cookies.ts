/**
 * Client-side and server-side utilities for non-auth persistent cookies.
 * Non-auth cookies (e.g., UI preferences, onboarding state) use a 30-day expiration securely.
 */

// CLIENT-SIDE COOKIE UTILITIES
export const cookieUtils = {
  /**
   * Sets a persistent browser cookie securely.
   * @param name Cookie name
   * @param value Cookie value
   * @param days Expiration in days (default: 30)
   */
  setCookie: (name: string, value: string, days: number = 30) => {
    if (typeof window === 'undefined') return;
    
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
    
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict;${secure}`;
  },

  /**
   * Retrieves a cookie value from the browser.
   */
  getCookie: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  },

  /**
   * Deletes a client-side cookie.
   */
  deleteCookie: (name: string) => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
  }
};

// SERVER-SIDE COOKIE UTILITIES (Next.js App Router)
// Important: This can only be imported/used in Next.js Server Components or Server Actions
import { cookies } from 'next/headers'

export async function getServerPreferences() {
  const cookieStore = await cookies();
  
  return {
    theme: cookieStore.get('theme')?.value || 'light',
    onboardingCompleted: cookieStore.get('onboardingCompleted')?.value === 'true',
    domainPreference: cookieStore.get('domainPreference')?.value || null,
  };
}

export async function setServerPreference(name: string, value: string, days: number = 30) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    maxAge: days * 24 * 60 * 60, // e.g. 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
}

