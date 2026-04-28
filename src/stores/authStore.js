import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { apiFetch } from '@/api.js'

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  if (!token) return true
  const payload = decodeJwt(token)
  if (!payload?.exp) return false
  return Date.now() >= payload.exp * 1000
}

export const useAuthStore = defineStore('authStore', () => {
  const storedNurse = localStorage.getItem('nurse')
  const storedToken = localStorage.getItem('token')

  const nurse = ref(storedNurse ? JSON.parse(storedNurse) : null)
  const token = ref(storedToken || null)

  const formLogin = ref({ email: '', password: '' })

  const resetFormLogin = () => {
    formLogin.value = { email: '', password: '' }
  }

  const clearSession = () => {
    token.value = null
    nurse.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('nurse')
    localStorage.removeItem('nurseId')
  }

  const isAuthenticated = computed(() => {
    if (!nurse.value) return false
    if (isTokenExpired(token.value)) return false
    return true
  })

  watch(isAuthenticated, (isAuth) => {
    if (!isAuth && (nurse.value || token.value)) {
      clearSession()
    }
  })

  const getToken = computed(() => token.value)

  const login = async () => {
    try {
      console.log('Login attempt:', formLogin.value)
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formLogin.value),
      })
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      const tokenFromResponse = data.accessToken || data.token
      if (tokenFromResponse) {
        token.value = tokenFromResponse
        localStorage.setItem('token', tokenFromResponse)

        const nurseData = data.user?.nurse || data.user || null
        nurse.value = nurseData
        localStorage.setItem('nurse', JSON.stringify(nurseData))
        localStorage.setItem(
          'nurseId',
          data.user?.nurseDetails?.nurseId || nurseData?.Id || nurseData?.id || '',
        )

        console.log('Login success')
        return true
      } else {
        console.error('Login failed:', data.message || 'No token received')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      clearSession()
    }
  }

  const startExpiryWatcher = () => {
    const interval = setInterval(() => {
      const t = localStorage.getItem('token')
      if (t && isTokenExpired(t)) {
        clearInterval(interval)
        clearSession()
        window.location.href = '/login'
      }
    }, 60_000)
    return interval
  }

  return {
    nurse,
    token,
    formLogin,
    isAuthenticated,
    getToken,
    login,
    logout,
    resetFormLogin,
    clearSession,
    startExpiryWatcher,
    isTokenExpired,
  }
})