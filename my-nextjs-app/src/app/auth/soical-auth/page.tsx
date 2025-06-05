'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SocialAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const user = searchParams.get('user')
    if (token && user) {
      sessionStorage.setItem('accessToken', token)
      sessionStorage.setItem('userData', user)
      router.push('/dashboard')
    } else {
      router.push('/auth/login?error=social-auth-failed')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}