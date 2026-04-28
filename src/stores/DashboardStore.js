import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './authStore.js'
import { apiFetch } from '@/api.js'

export const useDashboardStore = defineStore('dashboardStore', () => {
  const authStore = useAuthStore()

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }
  const stats = ref({
    totalPatients: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    followUpsDue: 0,
    totalRecords: 0,
  })

  const fetchStats = async () => {
    try {
      const response = await apiFetch('/api/dashboard/stats', {
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to fetch dashboard stats')
      const data = await response.json()
      stats.value = data
      console.log('Dashboard stats fetched successfully')
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  return { stats, fetchStats }
})
