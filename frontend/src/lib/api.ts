interface ApiResponse {
  success: boolean
  message?: string
  accessToken?: string
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(`http://localhost:8080/api/v1${url}`, {
    ...options,
    credentials: 'include',
  })

  if (response.status === 401) {
    try {
      const refreshResponse = await fetch('http://localhost:8080/api/v1/refresh', {
        method: 'GET',
        credentials: 'include',
      })
      const refreshData: ApiResponse = await refreshResponse.json()
      if (refreshData.success && refreshData.accessToken) {
        sessionStorage.setItem('accessToken', refreshData.accessToken)
        return fetch(`http://localhost:8080/api/v1${url}`, {
          ...options,
          credentials: 'include',
        })
      } else {
        throw new Error('Session expired')
      }
    } catch {
      sessionStorage.removeItem('userData')
      sessionStorage.removeItem('accessToken')
      window.location.href = '/auth/login'
      throw new Error('Network error during token refresh')
    }
  }

  return response
}