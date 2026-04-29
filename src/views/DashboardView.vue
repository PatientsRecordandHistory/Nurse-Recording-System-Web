<template>
  <div class="min-h-screen flex font-poppins bg-[#f8f9fc] text-gray-900">
    <SidebarComponent />

    <div class="main flex-1 ml-[280px] p-10 overflow-auto">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-1">
          Good {{ timeOfDay }},
          <span class="bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent">
            {{ nurseName }}
          </span>
          !
        </h1>
        <p class="text-sm text-gray-400">
          Here's what's happening at the clinic today — {{ todayDate }}
        </p>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="stat in statCards"
          :key="stat.label"
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              :style="{ background: stat.bg }"
            >
              <i :class="stat.icon" class="text-white text-sm"></i>
            </div>
            <span
              class="text-[10px] font-bold px-2 py-1 rounded-md"
              :style="{ background: stat.badgeBg, color: stat.badgeColor }"
            >
              {{ stat.badge }}
            </span>
          </div>
          <p class="text-2xl font-black text-gray-900 mb-0.5">{{ stat.value }}</p>
          <p class="text-xs font-medium text-gray-400">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Two column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        <!-- Patients list (2/3 width) -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 class="text-sm font-bold text-gray-800">All Patients</h2>
              <p class="text-xs text-gray-400 mt-0.5">Click a patient to view their records</p>
            </div>
            <div class="relative">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                v-model="patientSearch"
                type="text"
                placeholder="Search patients..."
                class="pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2933FF]/10 focus:border-[#2933FF] w-44 transition"
              />
            </div>
          </div>

          <div v-if="filteredDashboardPatients.length === 0" class="text-center py-12">
            <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <i class="fa-solid fa-user-slash text-gray-400"></i>
            </div>
            <p class="text-gray-400 text-sm">No patients found</p>
          </div>

          <div class="divide-y divide-gray-50 max-h-[420px] overflow-y-auto custom-scroll">
            <div
              v-for="patient in filteredDashboardPatients"
              :key="patient.id"
              @click="goToRecords(patient.id)"
              class="group flex items-center gap-3 px-6 py-3.5 hover:bg-blue-50/40 cursor-pointer transition-colors duration-150 relative"
            >
              <!-- Accent bar -->
              <div class="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-[#2933FF] to-[#FF5451] opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <!-- Avatar -->
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                {{ patient.firstname?.[0] }}{{ patient.lastname?.[0] }}
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate group-hover:text-[#2933FF] transition-colors">
                  {{ patient.firstname }} {{ patient.middlename ? patient.middlename + ' ' : '' }}{{ patient.lastname }}
                </p>
                <p class="text-xs text-gray-400 truncate">{{ patient.email || 'No email provided' }}</p>
              </div>

              <div class="flex-shrink-0 flex flex-col items-end gap-1">
                <span class="text-xs text-gray-400">{{ patient.emergencyContact }}</span>
                <span class="text-[10px] font-semibold text-[#2933FF] opacity-0 group-hover:opacity-100 transition-opacity">
                  View records →
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Appointments sidebar (1/3 width) -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 class="text-sm font-bold text-gray-800">Appointments</h2>
              <p class="text-xs text-gray-400 mt-0.5">Scheduled visits</p>
            </div>
            <button
              @click="router.push('/appointments')"
              class="text-xs font-semibold text-[#2933FF] hover:underline"
            >
              View all
            </button>
          </div>

          <div v-if="appointmentStore.appointments.length === 0" class="text-center py-12">
            <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <i class="fa-solid fa-calendar-xmark text-gray-400"></i>
            </div>
            <p class="text-gray-400 text-sm">No appointments scheduled</p>
          </div>

          <div class="divide-y divide-gray-50 max-h-[420px] overflow-y-auto custom-scroll">
            <div
              v-for="appt in sortedAppointments"
              :key="appt.id"
              class="group px-6 py-3.5 hover:bg-blue-50/40 transition-colors duration-150 relative"
            >
              <div class="absolute left-0 top-2 bottom-2 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                :class="isUpcoming(appt) ? 'bg-gradient-to-b from-[#2933FF] to-[#FF5451]' : 'bg-gray-300'"
              ></div>

              <div class="flex items-start justify-between mb-1">
                <p class="text-sm font-semibold text-gray-800 truncate flex-1 pr-2">{{ appt.reason }}</p>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 border"
                  :class="isUpcoming(appt) ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200'"
                >
                  {{ isUpcoming(appt) ? 'Upcoming' : 'Past' }}
                </span>
              </div>
              <p class="text-xs text-[#2933FF] font-medium mb-1.5">{{ getPatientName(appt.patientId) }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-400">
                <span class="flex items-center gap-1">
                  <i class="fa-solid fa-calendar text-[9px]"></i>{{ formatDate(appt.date) }}
                </span>
                <span class="flex items-center gap-1">
                  <i class="fa-solid fa-clock text-[9px]"></i>{{ formatTime(appt.time) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Medical Records -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 class="text-sm font-bold text-gray-800">Recent Medical Records</h2>
            <p class="text-xs text-gray-400 mt-0.5">Latest entries across all patients</p>
          </div>
        </div>

        <div v-if="recordStore.patientRecords.length === 0" class="text-center py-12">
          <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <i class="fa-solid fa-folder-open text-gray-400"></i>
          </div>
          <p class="text-gray-400 text-sm">No records yet</p>
        </div>

        <!-- Records as a clean list table -->
        <div class="divide-y divide-gray-50 max-h-[320px] overflow-y-auto custom-scroll">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            @click="goToRecords(record.patientId)"
            class="group flex items-center gap-4 px-6 py-3.5 hover:bg-blue-50/40 cursor-pointer transition-colors duration-150 relative"
          >
            <div class="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-[#2933FF] to-[#FF5451] opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <!-- Icon -->
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2933FF]/15 to-[#FF5451]/15 flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-stethoscope text-[11px] text-[#2933FF]"></i>
            </div>

            <!-- Diagnosis + record ID -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate group-hover:text-[#2933FF] transition-colors">
                {{ record.diagnosis || 'No diagnosis' }}
              </p>
              <p class="text-xs text-gray-400 truncate mt-0.5">{{ record.symptom || '—' }}</p>
            </div>

            <!-- Patient name -->
            <div class="text-xs font-semibold text-[#2933FF] flex-shrink-0 hidden md:block">
              {{ getPatientNameById(record.patientId) }}
            </div>

            <!-- Record ID -->
            <div class="hidden lg:block">
              <span class="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                {{ record.recordId }}
              </span>
            </div>

            <!-- Date -->
            <div class="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
              <i class="fa-solid fa-calendar text-[9px]"></i>
              {{ formatDate(record.date) }}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePatientStore } from '@/stores/patientsStore'
import { useAppointmentStore } from '@/stores/AppointmentStore'
import { usePatientRecord } from '@/stores/patientRecord'
import { useAuthStore } from '@/stores/authStore'
import SidebarComponent from '@/components/SidebarComponent.vue'

const router = useRouter()
const route = useRoute()
const patientStore = usePatientStore()
const appointmentStore = useAppointmentStore()
const recordStore = usePatientRecord()
const authStore = useAuthStore()

provide('router', router)
provide('route', route)
provide('authStore', authStore)

const patientSearch = ref('')

const nurseName = computed(() => {
  const name = authStore.nurse?.username || 'Nurse'
  return name.charAt(0).toUpperCase() + name.slice(1)
})

const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
})

const todayDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

/**
 * An appointment is upcoming only if it is NOT closed AND its date+time
 * is still in the future.
 */
const isUpcoming = (appointment) => {
  if (!appointment) return false
  if (appointment.status === 'Closed' || appointment.Status === 'Closed') return false
  const date = appointment.date ?? appointment.Date ?? ''
  const time = appointment.time ?? appointment.Time ?? '00:00'
  if (!date) return false
  return new Date(`${date}T${time}`) > new Date()
}

const upcomingCount = computed(() => {
  return appointmentStore.appointments.filter((a) => isUpcoming(a)).length
})

const statCards = computed(() => [
  {
    label: 'Total Patients',
    value: patientStore.patients.length,
    icon: 'fa-solid fa-users',
    bg: 'linear-gradient(135deg, #2933FF, #6366f1)',
    badge: 'All time',
    badgeBg: '#EEF2FF',
    badgeColor: '#4338ca',
  },
  {
    label: 'Total Appointments',
    value: appointmentStore.appointments.length,
    icon: 'fa-solid fa-calendar-check',
    bg: 'linear-gradient(135deg, #FF5451, #f97316)',
    badge: 'Scheduled',
    badgeBg: '#FFF7ED',
    badgeColor: '#c2410c',
  },
  {
    label: 'Upcoming',
    value: upcomingCount.value,
    icon: 'fa-solid fa-clock',
    bg: 'linear-gradient(135deg, #10b981, #059669)',
    badge: 'Future',
    badgeBg: '#ECFDF5',
    badgeColor: '#065f46',
  },
  {
    label: 'Medical Records',
    value: recordStore.patientRecords.length,
    icon: 'fa-solid fa-notes-medical',
    bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    badge: 'On file',
    badgeBg: '#F5F3FF',
    badgeColor: '#5b21b6',
  },
])

const filteredDashboardPatients = computed(() => {
  if (!patientSearch.value) return patientStore.patients
  const term = patientSearch.value.toLowerCase()
  return patientStore.patients.filter((p) => {
    const first = p.firstname ?? p.Firstname ?? ''
    const middle = p.middlename ?? p.Middlename ?? ''
    const last = p.lastname ?? p.Lastname ?? ''
    const email = p.email ?? p.Email ?? ''
    const contact = p.emergencyContact ?? p.EmergencyContact ?? ''
    return (
      `${first} ${middle} ${last}`.toLowerCase().includes(term) ||
      String(email).toLowerCase().includes(term) ||
      String(contact).includes(term)
    )
  })
})

const sortedAppointments = computed(() => {
  const now = new Date()
  const getDateTime = (a) => new Date(`${a.date ?? a.Date ?? ''}T${a.time ?? a.Time ?? '00:00'}`)
  return [...appointmentStore.appointments]
    .sort((a, b) => {
      const aUp = isUpcoming(a)
      const bUp = isUpcoming(b)
      if (aUp !== bUp) return aUp ? -1 : 1
      if (aUp && bUp) return getDateTime(a) - getDateTime(b)   // upcoming: soonest first
      return getDateTime(b) - getDateTime(a)                    // past: most recent first
    })
    .slice(0, 10)
})

const recentRecords = computed(() => {
  return [...recordStore.patientRecords]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)
})

const getPatientName = (patientId) => {
  const p = patientStore.patients.find((p) => Number(p.id ?? p.Id) === Number(patientId))
  if (!p) return 'Unknown Patient'
  const first = p.firstname ?? p.Firstname ?? ''
  const last = p.lastname ?? p.Lastname ?? ''
  return `${first} ${last}`.trim() || 'Unknown Patient'
}

const getPatientNameById = (patientId) => {
  const p = patientStore.patients.find((p) => Number(p.id ?? p.Id) === Number(patientId))
  if (!p) return 'Unknown Patient'
  const first = p.firstname ?? p.Firstname ?? ''
  const last = p.lastname ?? p.Lastname ?? ''
  return `${first} ${last}`.trim() || 'Unknown Patient'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (timeString) => {
  if (!timeString) return 'N/A'
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`
}

const goToRecords = (id) => {
  if (!id) return
  router.push({ name: 'patientrecords', params: { id } })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #2933ff, #ff5451);
  border-radius: 10px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>