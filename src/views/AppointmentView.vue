<template>
  <div class="min-h-screen flex font-poppins bg-[#F0F2FF] text-gray-900">
    <SidebarComponent />

    <div class="main flex-1 ml-[280px] overflow-auto">
      <!-- Sticky top bar -->
      <div
        class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-10 py-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2933FF] to-[#FF5451] flex items-center justify-center shadow-md"
          >
            <i class="fa-solid fa-calendar-check text-white text-sm"></i>
          </div>
          <div>
            <h2
              class="text-xl font-extrabold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
            >
              Appointments
            </h2>
            <p class="text-xs text-gray-400">{{ store.appointments.length }} total</p>
          </div>
        </div>
        <button
          @click="handleNewAppointment"
          class="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl shadow hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <i
            class="fa-solid fa-plus text-xs group-hover:rotate-90 transition-transform duration-200"
          ></i>
          New Appointment
        </button>
      </div>

      <div class="p-10">
        <!-- Search + Filters row -->
        <div class="flex flex-col sm:flex-row gap-4 mb-8">
          <div class="relative flex-1">
            <i
              class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm"
            ></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search by reason, patient, or date..."
              class="w-full pl-11 pr-5 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2933FF]/30 text-sm text-gray-700 placeholder-gray-300 transition-all"
            />
          </div>

          <!-- Filter pills -->
          <div class="flex gap-2 items-center">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeFilter = tab.key"
              class="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
              :class="
                activeFilter === tab.key
                  ? 'bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white shadow'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#2933FF]/30 hover:text-[#2933FF]'
              "
            >
              {{ tab.label }}
              <span class="ml-1.5 text-xs opacity-60">({{ tab.count }})</span>
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="displayedAppointments.length === 0"
          class="flex flex-col items-center justify-center py-24"
        >
          <div
            class="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center mb-4"
          >
            <i
              class="fa-solid fa-calendar-xmark text-2xl bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
            ></i>
          </div>
          <p class="text-gray-400 font-medium">No appointments found</p>
        </div>

        <!-- Cards -->
        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="appointment in displayedAppointments"
            :key="appointment.id"
            class="group bg-white rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
            :class="isExpired(appointment) ? 'border-gray-200 opacity-80' : 'border-gray-100'"
          >
            <!-- Closed overlay tint -->
            <div
              v-if="isExpired(appointment)"
              class="absolute inset-0 bg-gray-50/40 pointer-events-none z-0 rounded-2xl"
            ></div>

            <!-- Top accent -->
            <div
              class="h-1.5 w-full transition-all duration-300"
              :class="
                isExpired(appointment)
                  ? 'bg-gray-200'
                  : 'bg-gradient-to-r from-[#2933FF] to-[#FF5451] opacity-0 group-hover:opacity-100'
              "
            ></div>

            <div class="relative z-10 p-6">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    :class="
                      isExpired(appointment)
                        ? 'bg-gray-100'
                        : 'bg-gradient-to-br from-[#2933FF]/10 to-[#FF5451]/10'
                    "
                  >
                    <i
                      class="fa-solid fa-calendar-days text-sm"
                      :class="isExpired(appointment) ? 'text-gray-400' : 'text-[#2933FF]'"
                    ></i>
                  </div>
                  <div class="min-w-0">
                    <h2
                      class="font-bold text-sm leading-tight truncate"
                      :class="isExpired(appointment) ? 'text-gray-500' : 'text-gray-800'"
                    >
                      {{ appointment.reason }}
                    </h2>
                    <p class="text-xs text-gray-400 mt-0.5 font-mono">
                      {{ appointment.appointmentId || `#${appointment.id}` }}
                    </p>
                  </div>
                </div>

                <!-- Badges + actions -->
                <div class="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  <span
                    class="text-xs font-bold px-2 py-1 rounded-full"
                    :class="
                      isExpired(appointment)
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-green-50 text-green-700'
                    "
                  >
                    <i
                      class="mr-0.5 text-[10px]"
                      :class="isExpired(appointment) ? 'fa-solid fa-lock' : 'fa-solid fa-clock'"
                    ></i>
                    {{ isExpired(appointment) ? 'Closed' : 'Upcoming' }}
                  </span>
                  <button
                    @click="handleEdit(appointment)"
                    :disabled="isExpired(appointment)"
                    class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Edit"
                  >
                    <i class="fa-solid fa-pen text-[11px] text-[#2933FF]"></i>
                  </button>
                  <button
                    @click="confirmDelete(appointment)"
                    class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    title="Delete"
                  >
                    <i class="fa-solid fa-trash text-[11px] text-red-500"></i>
                  </button>
                </div>
              </div>

              <!-- Details -->
              <div class="space-y-2.5">
                <!-- Patient -->
                <div class="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50">
                  <i
                    class="fa-solid fa-user text-[11px] w-4 text-center"
                    :class="isExpired(appointment) ? 'text-gray-400' : 'text-[#2933FF]'"
                  ></i>
                  <div>
                    <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                      Patient
                    </p>
                    <p class="text-sm font-semibold text-gray-700">
                      {{ appointment._patientName || getPatientName(appointment.patientId) }}
                    </p>
                  </div>
                </div>

                <!-- Date + Time -->
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-gray-50">
                    <i
                      class="fa-solid fa-calendar text-[11px]"
                      :class="isExpired(appointment) ? 'text-gray-400' : 'text-[#2933FF]'"
                    ></i>
                    <div>
                      <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                        Date
                      </p>
                      <p class="text-sm font-semibold text-gray-700">
                        {{ formatDate(appointment.date) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-gray-50">
                    <i
                      class="fa-solid fa-clock text-[11px]"
                      :class="isExpired(appointment) ? 'text-gray-400' : 'text-[#FF5451]'"
                    ></i>
                    <div>
                      <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                        Time
                      </p>
                      <p class="text-sm font-semibold text-gray-700">
                        {{ formatTime(appointment.time) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment modal -->
    <AppointmentHandler v-if="showAppointmentModal" @modalClose="closeAppointmentModal" />

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <i class="fa-solid fa-exclamation-triangle text-xl text-red-500"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Delete Appointment</h3>
            <p class="text-sm text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm mb-6">
          Delete <span class="font-semibold text-gray-800">{{ appointmentToDelete?.reason }}</span
          >?
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="cancelDelete"
            class="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { useAppointmentStore } from '@/stores/AppointmentStore'
import { usePatientStore } from '@/stores/patientsStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import SidebarComponent from '@/components/SidebarComponent.vue'
import AppointmentHandler from '@/modals/AppoitmentHandler.vue'

const store = useAppointmentStore()
const patientStore = usePatientStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

provide('router', router)
provide('route', route)
provide('authStore', authStore)

const searchQuery = ref('')
const activeFilter = ref('All')
const showAppointmentModal = ref(false)
const showDeleteModal = ref(false)
const appointmentToDelete = ref(null)

const isExpired = (appointment) =>
  appointment.status === 'Closed' || appointment.Status === 'Closed'

const getPatientName = (patientId) => {
  if (!patientId) return 'Unknown Patient'
  const p = patientStore.patients.find((pt) => String(pt.id ?? pt.Id) === String(patientId))
  if (!p) return 'Unknown Patient'
  const first = p.firstname ?? p.Firstname ?? ''
  const last = p.lastname ?? p.Lastname ?? ''
  return `${first} ${last}`.trim() || 'Unknown Patient'
}

const filtered = computed(() => {
  if (!searchQuery.value) return store.appointments
  const q = searchQuery.value.toLowerCase()
  return store.appointments.filter((a) => {
    const name = (a._patientName || getPatientName(a.patientId)).toLowerCase()
    return (
      (a.reason ?? '').toLowerCase().includes(q) ||
      (a.appointmentId ?? '').toLowerCase().includes(q) ||
      name.includes(q) ||
      (a.date ?? '').includes(q)
    )
  })
})

const upcoming = computed(() => filtered.value.filter((a) => !isExpired(a)))
const closed = computed(() => filtered.value.filter((a) => isExpired(a)))

const tabs = computed(() => [
  { key: 'All', label: 'All', count: filtered.value.length },
  { key: 'Upcoming', label: 'Upcoming', count: upcoming.value.length },
  { key: 'Closed', label: 'Closed', count: closed.value.length },
])

const displayedAppointments = computed(() => {
  let list = filtered.value
  if (activeFilter.value === 'Upcoming') list = upcoming.value
  else if (activeFilter.value === 'Closed') list = closed.value
  return [...list].sort((a, b) => {
    const aExp = isExpired(a)
    const bExp = isExpired(b)
    if (aExp !== bExp) return aExp ? 1 : -1
    const dateA = new Date(`${a.date ?? ''}T${a.time ?? '00:00'}`)
    const dateB = new Date(`${b.date ?? ''}T${b.time ?? '00:00'}`)
    return aExp ? dateB - dateA : dateA - dateB
  })
})

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

const handleNewAppointment = () => {
  store.resetForm()
  showAppointmentModal.value = true
}

const handleEdit = (appointment) => {
  if (isExpired(appointment)) return
  store.setFormforEdit(appointment)
  showAppointmentModal.value = true
}

const closeAppointmentModal = () => {
  showAppointmentModal.value = false
}

const confirmDelete = (appointment) => {
  appointmentToDelete.value = appointment
  showDeleteModal.value = true
}

const cancelDelete = () => {
  appointmentToDelete.value = null
  showDeleteModal.value = false
}

const handleDelete = async () => {
  if (appointmentToDelete.value) {
    await store.deleteAppointment(appointmentToDelete.value.id ?? appointmentToDelete.value.Id)
    showDeleteModal.value = false
    appointmentToDelete.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
</style>
