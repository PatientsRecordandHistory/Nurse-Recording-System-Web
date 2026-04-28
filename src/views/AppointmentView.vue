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

        <!-- ── Upcoming Soon Banner ─────────────────────────────────────────── -->
        <transition name="slide-down">
          <div
            v-if="imminentAppointments.length > 0"
            class="mb-8"
          >
            <div class="flex items-center gap-2 mb-3">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h3 class="text-sm font-bold text-amber-700 uppercase tracking-wider">
                Starting in ~10 minutes
              </h3>
              <span class="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {{ imminentAppointments.length }}
              </span>
            </div>

            <div class="flex flex-col gap-3">
              <div
                v-for="appt in imminentAppointments"
                :key="appt.id ?? appt.Id"
                class="flex items-center gap-4 p-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm"
              >
                <div class="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <i class="fa-solid fa-bell text-amber-500 text-base"></i>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-800 truncate">
                    {{ appt._patientName || getPatientName(appt.patientId) }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ appt.reason }} &mdash;
                    <span class="font-semibold text-amber-700">{{ formatTime(appt.time) }}</span>
                    on {{ formatDate(appt.date) }}
                  </p>
                </div>

                <div class="flex-shrink-0 text-center px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-200">
                  <p class="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">In</p>
                  <p class="text-sm font-extrabold text-amber-700">
                    {{ minutesUntil(appt) }} min
                  </p>
                </div>

                <button
                  @click="dismissAlert(appt.id ?? appt.Id)"
                  class="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  title="Dismiss alert"
                >
                  <i class="fa-solid fa-xmark text-xs text-amber-600"></i>
                </button>
              </div>
            </div>
          </div>
        </transition>
        <!-- ── End Upcoming Soon Banner ──────────────────────────────────────── -->

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

        <!-- ── Appointment + Follow-up List ─────────────────────────────────── -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <!-- Table header -->
          <div class="grid items-center gap-4 px-5 py-2.5 border-b border-gray-100 bg-gray-50/70" style="grid-template-columns: 2rem 1fr 11rem 7rem 6rem 8.5rem;">
            <div></div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Reason / Patient</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Time</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</span>
          </div>

          <div class="divide-y divide-gray-100">
            <template v-for="row in flatRows" :key="row._type === 'followup' ? `fu-${row.id}` : row.id">

              <!-- ── Appointment Row ────────────────────────────────────────── -->
              <div
                v-if="row._type === 'appointment'"
                class="group grid items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150 relative"
                style="grid-template-columns: 2rem 1fr 11rem 7rem 6rem 8.5rem;"
                :class="[
                  isExpired(row._self) ? 'opacity-60' : '',
                  isImminent(row._self) ? 'bg-amber-50/60 hover:bg-amber-50' : '',
                ]"
              >
                <!-- Left accent bar -->
                <div
                  class="absolute left-0 top-0 bottom-0 w-0.5"
                  :class="
                    isExpired(row._self)
                      ? 'bg-gray-300'
                      : isImminent(row._self)
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-b from-[#2933FF] to-[#FF5451] opacity-0 group-hover:opacity-100 transition-opacity'
                  "
                ></div>

                <!-- Col 1: Icon -->
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                  :class="
                    isExpired(row._self)
                      ? 'bg-gray-100'
                      : isImminent(row._self)
                        ? 'bg-amber-100'
                        : 'bg-gradient-to-br from-[#2933FF]/10 to-[#FF5451]/10'
                  "
                >
                  <span v-if="isImminent(row._self)" class="absolute -top-1 -right-1 flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <i class="fa-solid fa-calendar-days text-xs"
                    :class="isExpired(row._self) ? 'text-gray-400' : isImminent(row._self) ? 'text-amber-500' : 'text-[#2933FF]'"
                  ></i>
                </div>

                <!-- Col 2: Reason + Patient -->
                <div class="min-w-0">
                  <p class="text-sm font-bold truncate" :class="isExpired(row._self) ? 'text-gray-500' : 'text-gray-800'">
                    {{ row.reason }}
                  </p>
                  <p class="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <i class="fa-solid fa-user text-[9px]" :class="isExpired(row._self) ? 'text-gray-300' : 'text-[#2933FF]'"></i>
                    {{ row._patientName || getPatientName(row.patientId) }}
                    <span class="font-mono text-[10px] ml-1">{{ row.appointmentId || `#${row.id}` }}</span>
                  </p>
                </div>

                <!-- Col 3: Date -->
                <div class="text-sm text-gray-600 flex items-center gap-1.5">
                  <i class="fa-solid fa-calendar text-[10px]" :class="isExpired(row._self) ? 'text-gray-300' : 'text-[#2933FF]'"></i>
                  {{ formatDate(row.date) }}
                </div>

                <!-- Col 4: Time -->
                <div class="text-sm text-gray-600 flex items-center gap-1.5">
                  <i class="fa-solid fa-clock text-[10px]" :class="isExpired(row._self) ? 'text-gray-300' : 'text-[#FF5451]'"></i>
                  {{ formatTime(row.time) }}
                </div>

                <!-- Col 5: Status badge -->
                <div>
                  <span v-if="isImminent(row._self)" class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    <i class="fa-solid fa-bell mr-0.5 text-[10px]"></i>Soon
                  </span>
                  <span v-else class="text-xs font-bold px-2 py-0.5 rounded-full"
                    :class="isExpired(row._self) ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'"
                  >
                    <i class="mr-0.5 text-[10px]" :class="isExpired(row._self) ? 'fa-solid fa-lock' : 'fa-solid fa-clock'"></i>
                    {{ isExpired(row._self) ? 'Closed' : 'Upcoming' }}
                  </span>
                </div>

                <!-- Col 6: Actions -->
                <div class="flex items-center gap-2 justify-end">
                  <button @click="handleEdit(row._self)" :disabled="isExpired(row._self)"
                    class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Edit"><i class="fa-solid fa-pen text-[11px] text-[#2933FF]"></i></button>
                  <button @click="confirmDelete(row._self)"
                    class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    title="Delete"><i class="fa-solid fa-trash text-[11px] text-red-500"></i></button>
                </div>
              </div>
              <!-- ── End Appointment Row ─────────────────────────────────────── -->

              <!-- ── Follow-up Row ───────────────────────────────────────────── -->
              <div
                v-else-if="row._type === 'followup'"
                @click="navigateToFollowup(row._appointment, row)"
                class="group grid items-center gap-4 px-5 py-3 bg-emerald-50/20 hover:bg-emerald-50/50 transition-colors duration-150 cursor-pointer border-l-2 border-emerald-300"
                style="grid-template-columns: 2rem 1fr 11rem 7rem 6rem 8.5rem;"
              >
                <!-- Icon -->
                <div class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 ml-5">
                  <i class="fa-solid fa-rotate-right text-emerald-500 text-[10px]"></i>
                </div>

                <!-- Reason + Patient -->
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-700 truncate">
                    {{ row.new_diagnostic || row.diagnosis || 'Follow-up Visit' }}
                  </p>
                  <p class="text-xs text-emerald-600 truncate flex items-center gap-1 mt-0.5">
                    <i class="fa-solid fa-stethoscope text-[9px]"></i>
                    {{ row.new_symptom || row.symptom || (row._appointment._patientName || getPatientName(row._appointment.patientId)) }}
                  </p>
                </div>

                <!-- Date -->
                <div class="text-sm text-gray-500 flex items-center gap-1.5">
                  <i class="fa-solid fa-calendar-check text-[10px] text-emerald-500"></i>
                  {{ formatDate(row.date) }}
                </div>

                <!-- Time -->
                <div></div>

                <!-- Badge -->
                <div>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    <i class="fa-solid fa-rotate-right mr-0.5 text-[10px]"></i>Follow-up
                  </span>
                </div>

                <!-- Arrow -->
                <div class="flex justify-end">
                  <i class="fa-solid fa-arrow-right text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"></i>
                </div>
              </div>
              <!-- ── End Follow-up Row ───────────────────────────────────────── -->

            </template>
          </div>
        </div>
        <!-- ── End List ───────────────────────────────────────────────────────── -->

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
          Delete <span class="font-semibold text-gray-800">{{ appointmentToDelete?.reason }}</span>?
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
import { useFollowupStore } from '@/stores/FollowupStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import SidebarComponent from '@/components/SidebarComponent.vue'
import AppointmentHandler from '@/modals/AppoitmentHandler.vue'
import { useAppointmentReminder } from '@/composables/useAppointmentReminder'

const store = useAppointmentStore()
const patientStore = usePatientStore()
const followupStore = useFollowupStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

provide('router', router)
provide('route', route)
provide('authStore', authStore)

// ── Reminder composable ──────────────────────────────────────────────────────
// Pass `store.appointments` (the ref itself), NOT `store.appointments.value`.
const { imminentAppointments, dismissAlert } = useAppointmentReminder(store.appointments)

// ── UI state ─────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const activeFilter = ref('All')
const showAppointmentModal = ref(false)
const showDeleteModal = ref(false)
const appointmentToDelete = ref(null)

// ── Helpers ───────────────────────────────────────────────────────────────────
const isExpired = (appointment) => {
  if (appointment.status === 'Closed' || appointment.Status === 'Closed') return true
  const date = appointment.date ?? appointment.Date ?? ''
  const time = appointment.time ?? appointment.Time ?? '00:00'
  if (!date) return false
  return new Date(`${date}T${time}`) < new Date()
}

const isImminent = (appointment) => {
  const id = appointment.id ?? appointment.Id
  return imminentAppointments.value.some((a) => (a.id ?? a.Id) === id)
}

const minutesUntil = (appointment) => {
  const date = appointment.date ?? appointment.Date ?? ''
  const time = appointment.time ?? appointment.Time ?? '00:00'
  if (!date) return 0
  const dt = new Date(`${date}T${time}`)
  return Math.max(0, Math.floor((dt.getTime() - Date.now()) / 60_000))
}

const getPatientName = (patientId) => {
  if (!patientId) return 'Unknown Patient'
  const p = patientStore.patients.find((pt) => String(pt.id ?? pt.Id) === String(patientId))
  if (!p) return 'Unknown Patient'
  const first = p.firstname ?? p.Firstname ?? ''
  const last = p.lastname ?? p.Lastname ?? ''
  return `${first} ${last}`.trim() || 'Unknown Patient'
}

// ── Follow-up helpers ─────────────────────────────────────────────────────────
/**
 * Returns follow-ups for the appointment's patient whose date is TODAY or
 * in the FUTURE. Past follow-ups are excluded — they're already done.
 * Sorted soonest-first.
 */
const getActiveFollowups = (appointment) => {
  const patientId = appointment.patientId ?? appointment.PatientId
  if (!patientId) return []

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  return [...followupStore.followups]
    .filter((f) => {
      if (String(f.patientId ?? f.PatientId) !== String(patientId)) return false
      if (!f.date) return false
      const followupDate = new Date(f.date)
      followupDate.setHours(0, 0, 0, 0)
      // Only show today or future follow-ups
      return followupDate >= todayStart
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * Navigate to the specific follow-up within the RecordFollowupView.
 */
const navigateToFollowup = (appointment, followup) => {
  const patientId = appointment.patientId ?? appointment.PatientId
  const recordId = followup.recordId ?? followup.RecordId
  if (!patientId || !recordId) return
  router.push({
    name: 'record',
    params: {
      patientId: String(patientId),
      recordId: String(recordId),
      followupId: String(followup.id ?? followup.Id),
    },
  })
}

// ── Filters ───────────────────────────────────────────────────────────────────
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
  const now = new Date()
  const isPast = (x) => {
    if (isExpired(x)) return true
    const dt = new Date(`${x.date ?? ''}T${x.time ?? '00:00'}`)
    return dt < now
  }
  return [...list].sort((a, b) => {
    const aPast = isPast(a)
    const bPast = isPast(b)
    // Past / closed always sink to the bottom
    if (aPast !== bPast) return aPast ? 1 : -1
    // Within each group sort by date+time ascending (soonest first)
    const dateA = new Date(`${a.date ?? ''}T${a.time ?? '00:00'}`)
    const dateB = new Date(`${b.date ?? ''}T${b.time ?? '00:00'}`)
    return dateA - dateB
  })
})

// ── Formatters ────────────────────────────────────────────────────────────────
/**
 * Flattened date-sorted list of appointment + follow-up rows.
 * Follow-ups tagged with _type:'followup' and _appointment ref.
 * Past/closed rows sink to bottom; within groups sorted by date asc.
 */
const flatRows = computed(() => {
  const now = new Date()
  const rows = []
  for (const appt of displayedAppointments.value) {
    rows.push({ _type: 'appointment', ...appt, _self: appt })
    for (const fu of getActiveFollowups(appt)) {
      rows.push({ _type: 'followup', _appointment: appt, ...fu })
    }
  }
  const getDateTime = (row) => {
    if (row._type === 'followup') return new Date(`${row.date ?? ''}T00:00`)
    return new Date(`${row.date ?? ''}T${row.time ?? '00:00'}`)
  }
  const isPast = (row) => {
    if (row._type === 'appointment' && isExpired(row._self)) return true
    return getDateTime(row) < now
  }
  return rows.sort((a, b) => {
    const aPast = isPast(a)
    const bPast = isPast(b)
    if (aPast !== bPast) return aPast ? 1 : -1
    return getDateTime(a) - getDateTime(b)
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

// ── Actions ───────────────────────────────────────────────────────────────────
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>