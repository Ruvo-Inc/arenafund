'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-2xl font-semibold">Sign In Required</h1>
            <p className="mb-6 text-gray-600">
              You need to be signed in to access this page.
            </p>
            <div className="space-y-4">
              <a
                href="/auth/signin"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In
              </a>
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="/auth/signin?mode=signup"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign up here
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
