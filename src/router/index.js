import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Patientview from '../views/PatientView.vue'
import PatientRecords from '@/views/PatientRecords.vue'
import LoginView from '@/views/LoginView.vue'
import AppointmentView from '@/views/AppointmentView.vue'
import DashboardView from '@/views/DashboardView.vue'
import { useDashboardStore } from '@/stores/DashboardStore'
import { usePatientStore } from '@/stores/patientsStore'
import { useAppointmentStore } from '@/stores/AppointmentStore'
import { usePatientRecord } from '@/stores/patientRecord'
import { useFollowupStore } from '@/stores/FollowupStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/patients',
      name: 'patients',
      component: Patientview,
      meta: { requiresAuth: true },
    },
    {
      path: '/patientrecords/:id',
      name: 'patientrecords',
      component: PatientRecords,
      meta: { requiresAuth: true },
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: AppointmentView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/print/:patientId/:recordId?',
      name: 'printview',
      component: () => import('../views/PrintView.vue'),
      meta: { requiresAuth: true },
    },
    {
      // Record detail + followups view
      path: '/record/:patientId/:recordId/:followupId?',
      name: 'record',
      component: () => import('../views/RecordFollowupView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/recommendation/:patientId/:recordId',
      name: 'recommendation',
      component: () => import('../views/Recommendation.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

router.afterEach((to) => {
  const authStore = useAuthStore()
  
  // Only fetch if the user is logged in
  if (!authStore.isAuthenticated) return

  // Map route names to their respective store fetch actions
  const routeActions = {
    // 'home': () => useDashboardStore().fetchStats(),
    'patients': () => usePatientStore().fetchPatients(),
    'appointments': () => useAppointmentStore().fetchAppointments(),
    'patientrecords': () => usePatientRecord().fetchRecords(),
    'record': () => useFollowupStore().fetchFollowups()
  }

  const reloadData = routeActions[to.name]
  if (reloadData) {
    console.log(`Auto-reloading data for route: ${String(to.name)}`)
    reloadData()
  }
})

export default router
