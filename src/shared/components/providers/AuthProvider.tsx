'use client'

import { useAuthStore } from '@/shared/stores/authStore';
import React, { useEffect, useState } from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Test the token
    // axios.get('/auth/me')
    //   .then(response => {
    //     // Token is valid, keep the user logged in
    //     setAuth(response.data)
    //   })
    //   .catch(error => {
    //     // Token is invalid, clear auth and redirect to login
    //     console.error("Token invalid, logging out", error)
    //   })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    setTimeout(() => {
      setAuth({
        id: 1,
        name: "Admin",
        auth_id: "admin",
        image: "admin",
        base_role: "SUPER_ADMIN",
        status: "active",
        permissions: [],
        avatar: "admin",
        token: "admin",
      });
      setLoading(false)
    }, 1000);

  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>{children}</>
  )
}