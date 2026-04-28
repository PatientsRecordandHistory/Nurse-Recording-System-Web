<template>
  <div class="min-h-screen flex font-poppins bg-[#F0F2FF] text-gray-900">
    <!-- Sidebar -->
    <SidebarComponent />

    <!-- Main Content -->
    <div class="main flex-1 ml-[280px] p-10 overflow-auto">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-1">
          Good {{ timeOfDay }},
          <span class="bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent">
            {{ nurseName }}
          </span>
          👋
        </h1>
        <p class="text-gray-500 text-sm">
          Here's what's happening at the clinic today — {{ todayDate }}
        </p>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div
          v-for="stat in statCards"
          :key="stat.label"
          class="stat-card bg-white rounded-2xl p-6 shadow-sm border border-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
        >
          <div class="flex items-start justify-between mb-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
              :style="{ background: stat.bg }"
            >
              <i :class="stat.icon" class="text-white text-lg"></i>
            </div>
            <span
              class="text-xs font-bold px-2 py-1 rounded-full"
              :style="{ background: stat.badgeBg, color: stat.badgeColor }"
            >
              {{ stat.badge }}
            </span>
          </div>
          <p class="text-3xl font-black text-gray-900 mb-1">{{ stat.value }}</p>
          <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Two column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Patients list (2/3 width) -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-white p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">All Patients</h2>
              <p class="text-xs text-gray-400 mt-0.5">Click a patient to view their records</p>
            </div>
            <div class="relative">
              <i
                class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              ></i>
              <input
                v-model="patientSearch"
                type="text"
                placeholder="Search patients..."
                class="pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2933FF]/30 w-48"
              />
            </div>
          </div>

          <div v-if="filteredDashboardPatients.length === 0" class="text-center py-10">
            <div
              class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"
            >
              <i class="fa-solid fa-user-slash text-gray-400 text-xl"></i>
            </div>
            <p class="text-gray-500 text-sm">No patients found</p>
          </div>

          <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scroll">
            <div
              v-for="patient in filteredDashboardPatients"
              :key="patient.id"
              @click="goToRecords(patient.id)"
              class="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#2933FF]/30 hover:bg-gradient-to-r hover:from-[#2933FF]/5 hover:to-[#FF5451]/5 cursor-pointer transition-all group"
            >
              <div
                class="w-11 h-11 rounded-full bg-gradient-to-r from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
              >
                {{ patient.firstname?.[0] }}{{ patient.lastname?.[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="font-semibold text-gray-800 text-sm truncate group-hover:text-[#2933FF] transition-colors"
                >
                  {{ patient.firstname }} {{ patient.middlename ? patient.middlename + ' ' : ''
                  }}{{ patient.lastname }}
                </p>
                <p class="text-xs text-gray-400 truncate">
                  {{ patient.email || 'No email provided' }}
                </p>
              </div>
              <div class="flex-shrink-0 flex flex-col items-end gap-1">
                <span class="text-xs text-gray-400">{{ patient.emergencyContact }}</span>
                <span
                  class="text-xs font-semibold text-[#2933FF] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View records →
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Appointments sidebar (1/3 width) -->
        <div class="bg-white rounded-2xl shadow-sm border border-white p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Appointments</h2>
              <p class="text-xs text-gray-400 mt-0.5">Scheduled visits</p>
            </div>
            <button
              @click="router.push('/appointments')"
              class="text-xs font-semibold text-[#2933FF] hover:underline"
            >
              View all
            </button>
          </div>

          <div v-if="appointmentStore.appointments.length === 0" class="text-center py-10">
            <div
              class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"
            >
              <i class="fa-solid fa-calendar-xmark text-gray-400 text-xl"></i>
            </div>
            <p class="text-gray-500 text-sm">No appointments scheduled</p>
          </div>

          <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scroll">
            <div
              v-for="appt in sortedAppointments"
              :key="appt.id"
              class="p-4 rounded-xl border border-gray-100 hover:border-[#2933FF]/20 transition-all"
            >
              <div class="flex items-start justify-between mb-2">
                <p class="text-sm font-semibold text-gray-800 leading-tight">{{ appt.reason }}</p>
                <span
                  class="text-xs font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                  :class="
                    isUpcoming(appt) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  "
                >
                  {{ isUpcoming(appt) ? 'Upcoming' : 'Past' }}
                </span>
              </div>
              <p class="text-xs text-[#2933FF] font-medium mb-1">
                {{ getPatientName(appt.patientId) }}
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-400">
                <span><i class="fa-solid fa-calendar mr-1"></i>{{ formatDate(appt.date) }}</span>
                <span><i class="fa-solid fa-clock mr-1"></i>{{ formatTime(appt.time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Medical Records -->
      <div class="bg-white rounded-2xl shadow-sm border border-white p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Recent Medical Records</h2>
            <p class="text-xs text-gray-400 mt-0.5">Latest entries across all patients</p>
          </div>
        </div>

        <div v-if="recordStore.patientRecords.length === 0" class="text-center py-10">
          <div
            class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"
          >
            <i class="fa-solid fa-folder-open text-gray-400 text-xl"></i>
          </div>
          <p class="text-gray-500 text-sm">No records yet</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            @click="goToRecords(record.patientId)"
            class="p-4 rounded-xl border border-gray-100 hover:border-[#2933FF]/30 hover:shadow-md cursor-pointer transition-all group"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center"
                >
                  <i class="fa-solid fa-stethoscope text-xs text-[#2933FF]"></i>
                </div>
                <div>
                  <p
                    class="text-sm font-bold text-gray-800 group-hover:text-[#2933FF] transition-colors"
                  >
                    {{ record.diagnosis || 'No diagnosis' }}
                  </p>
                  <p class="text-xs text-gray-400">{{ record.recordId }}</p>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 line-clamp-2 mb-3">{{ record.symptom }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#2933FF]">{{
                getPatientNameById(record.patientId)
              }}</span>
              <span class="text-xs text-gray-400">{{ formatDate(record.date) }}</span>
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
  return [...appointmentStore.appointments]
    .sort((a, b) => new Date(b.date ?? b.Date) - new Date(a.date ?? a.Date))
    .slice(0, 10)
})

const recentRecords = computed(() => {
  return [...recordStore.patientRecords]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)
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

const isUpcoming = (appointment) => {
  if (!appointment) return false
  return appointment.status !== 'Closed' && appointment.Status !== 'Closed'
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
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${minutes} ${ampm}`
}

const goToRecords = (id) => {
  if (!id) {
    console.warn('Cannot navigate to patient records: missing patient ID')
    return
  }
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
