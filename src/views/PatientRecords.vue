<template>
  <div class="min-h-screen flex font-poppins bg-[#F0F2FF] text-gray-900">
    <SidebarComponent />

    <div class="main flex-1 ml-[280px] overflow-auto">

      <!-- Sticky top bar -->
      <div class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-10 py-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <i class="fa-solid fa-arrow-left text-gray-600 text-sm"></i>
          </button>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {{ patientInitials }}
            </div>
            <div>
              <h1 class="text-lg font-extrabold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent leading-tight">
                {{ patientFullName }}
              </h1>
              <p class="text-xs text-gray-400">Patient #{{ patientId }} · Medical Records</p>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="printAllRecords"
            class="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 text-sm font-semibold rounded-xl hover:bg-purple-100 transition-all hover:scale-105 active:scale-95"
          >
            <i class="fa-solid fa-print text-xs"></i>
            Print All
          </button>
          <button
            @click="openAddRecordModal"
            class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl shadow hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            New Record
          </button>
        </div>
      </div>

      <div class="p-10">

        <!-- Search -->
        <div class="relative mb-8">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search records by diagnosis, symptom, treatment..."
            class="w-full pl-11 pr-5 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2933FF]/30 text-sm text-gray-700 placeholder-gray-300 transition-all"
          />
        </div>

        <!-- Empty state -->
        <div v-if="filteredRecords.length === 0" class="flex flex-col items-center justify-center py-24">
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center mb-4">
            <i class="fa-solid fa-folder-open text-2xl bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"></i>
          </div>
          <p class="text-gray-400 font-medium">No records found</p>
          <p class="text-gray-300 text-sm mt-1">Add a new record to get started</p>
        </div>

        <!-- Records Grid -->
        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="record in filteredRecords"
            :key="record.id"
            class="group bg-white rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col relative"
            :class="record.closed ? 'border-gray-200 opacity-80' : 'border-gray-100'"
            @click="goToFollowup(record)"
          >
            <!-- Closed overlay -->
            <div v-if="record.closed" class="absolute inset-0 bg-gray-50/40 pointer-events-none z-0 rounded-2xl"></div>

            <!-- Top accent bar -->
            <div
              class="h-1.5 w-full transition-opacity duration-300"
              :class="record.closed ? 'bg-gray-200' : 'bg-gradient-to-r from-[#2933FF] to-[#FF5451] opacity-0 group-hover:opacity-100'"
            ></div>

            <div class="relative z-10 p-6 flex flex-col flex-1">

              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    :class="record.closed ? 'bg-gray-100' : 'bg-gradient-to-br from-[#2933FF]/10 to-[#FF5451]/10'"
                  >
                    <i
                      class="fa-solid fa-stethoscope text-sm"
                      :class="record.closed ? 'text-gray-400' : 'text-[#2933FF]'"
                    ></i>
                  </div>
                  <div class="min-w-0">
                    <h2
                      class="font-bold text-sm leading-tight truncate"
                      :class="record.closed ? 'text-gray-500' : 'text-gray-800'"
                    >
                      {{ record.diagnosis || 'No diagnosis' }}
                    </h2>
                    <p class="text-xs text-gray-400 mt-0.5 font-mono">{{ record.recordId }}</p>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="flex gap-1.5 ml-2 flex-shrink-0" @click.stop>
                  <span v-if="record.closed" class="self-center text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 mr-1">
                    <i class="fa-solid fa-lock text-[10px] mr-0.5"></i>Closed
                  </span>
                  <button
                    @click="handleToggleClosed(record)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-sm transition-all hover:scale-110 active:scale-95"
                    :class="record.closed ? 'bg-green-50 hover:bg-green-100' : 'bg-orange-50 hover:bg-orange-100'"
                    :title="record.closed ? 'Reopen Record' : 'Close Record'"
                  >
                    <i class="text-[11px]" :class="record.closed ? 'fa-solid fa-lock-open text-green-600' : 'fa-solid fa-lock text-orange-500'"></i>
                  </button>
                  <button
                    @click="printSingleRecord(record.id)"
                    class="w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    title="Print"
                  >
                    <i class="fa-solid fa-print text-[11px] text-purple-600"></i>
                  </button>
                  <button
                    @click="handleEdit(record)"
                    :disabled="record.closed"
                    class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Edit"
                  >
                    <i class="fa-solid fa-pen text-[11px] text-[#2933FF]"></i>
                  </button>
                  <button
                    @click="confirmDelete(record)"
                    class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    title="Delete"
                  >
                    <i class="fa-solid fa-trash text-[11px] text-red-500"></i>
                  </button>
                </div>
              </div>

              <!-- Content rows -->
              <div class="space-y-3 flex-1 mb-4">
                <div v-if="record.symptom" class="flex items-start gap-2.5">
                  <span class="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="fa-solid fa-user-injured text-[9px] text-[#2933FF]"></i>
                  </span>
                  <div>
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Symptom</p>
                    <p class="text-sm text-gray-700 line-clamp-2">{{ record.symptom }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-2.5">
                  <span class="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="fa-solid fa-pills text-[9px] text-[#FF5451]"></i>
                  </span>
                  <div>
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Treatment</p>
                    <p class="text-sm text-gray-700 line-clamp-2">{{ record.treatment || '—' }}</p>
                  </div>
                </div>

                <div v-if="record.notes" class="flex items-start gap-2.5">
                  <span class="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="fa-solid fa-notes-medical text-[9px] text-gray-400"></i>
                  </span>
                  <div>
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Notes</p>
                    <p class="text-sm text-gray-700 line-clamp-2">{{ record.notes }}</p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                <p class="text-xs text-gray-400 flex items-center gap-1.5">
                  <i class="fa-solid fa-calendar text-[10px]"></i>
                  {{ formatDate(record.date) }}
                </p>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="record.closed
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-emerald-50 text-emerald-700'"
                >
                  <i class="mr-1 text-[10px]" :class="record.closed ? 'fa-solid fa-ban' : 'fa-solid fa-rotate-right'"></i>
                  <span v-if="record.closed">Closed</span>
                  <span v-else>{{ getFollowupCount(record.id) }} follow-up{{ getFollowupCount(record.id) !== 1 ? 's' : '' }}</span>
                </span>
              </div>

              <!-- Hover hint -->
              <p v-if="!record.closed" class="text-xs text-center text-[#2933FF] font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                View details & follow-ups →
              </p>
              <p v-else class="text-xs text-center text-gray-400 font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                Reopen to add follow-ups
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <RecordsHandler v-if="showRecordModal" @modalClose="closeRecordModal" />

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-poppins">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <i class="fa-solid fa-exclamation-triangle text-xl text-red-500"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Delete Record</h3>
            <p class="text-sm text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm mb-6">
          Delete record for <span class="font-semibold text-gray-800">{{ recordToDelete?.diagnosis }}</span>?
        </p>
        <div class="flex justify-end gap-3">
          <button @click="cancelDelete" class="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all">Cancel</button>
          <button @click="handleDelete" class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { usePatientRecord } from '@/stores/patientRecord'
import { usePatientStore } from '@/stores/patientsStore'
import { useAuthStore } from '@/stores/authStore'
import { useFollowupStore } from '@/stores/FollowupStore'
import { computed, ref, provide } from 'vue'
import SidebarComponent from '@/components/SidebarComponent.vue'
import RecordsHandler from '@/modals/RecordsHandler.vue'

const route = useRoute()
const router = useRouter()
const patientsStore = usePatientStore()
const patientRecord = usePatientRecord()
const authStore = useAuthStore()
const followupStore = useFollowupStore()

provide('router', router)
provide('route', route)
provide('authStore', authStore)

const patientId = Number(route.params.id)
const searchQuery = ref('')
const showRecordModal = ref(false)
const showDeleteModal = ref(false)
const recordToDelete = ref(null)

const patient = computed(() => patientsStore.patients.find((p) => Number(p.id ?? p.Id) === patientId))

const patientFullName = computed(() => {
  if (!patient.value) return `Patient #${patientId}`
  const { firstname, middlename, lastname } = patient.value
  return [firstname, middlename, lastname].filter(Boolean).join(' ')
})

const patientInitials = computed(() => {
  if (!patient.value) return '?'
  const f = patient.value.firstname?.[0] ?? ''
  const l = patient.value.lastname?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
})

const records = computed(() => patientRecord.getpatient(patientId))

const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value
  const query = searchQuery.value.toLowerCase()
  return records.value.filter(
    (r) =>
      r.diagnosis?.toLowerCase().includes(query) ||
      r.symptom?.toLowerCase().includes(query) ||
      r.treatment?.toLowerCase().includes(query) ||
      r.notes?.toLowerCase().includes(query) ||
      r.recordId?.toLowerCase().includes(query),
  )
})

const getFollowupCount = (recordId) =>
  followupStore.followups.filter(
    (f) => String(f.patientId) === String(patientId) && String(f.recordId) === String(recordId),
  ).length

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const goBack = () => router.push({ name: 'home' })
const goToFollowup = (record) => router.push({ name: 'record', params: { patientId, recordId: record.id } })
const printAllRecords = () => router.push({ name: 'printview', params: { patientId } })
const printSingleRecord = (recordId) => router.push({ name: 'printview', params: { patientId, recordId } })

const openAddRecordModal = () => {
  patientRecord.resetRecordForm()
  showRecordModal.value = true
}

const handleEdit = (record) => {
  if (record.closed) return
  patientRecord.setFormforEdit(record)
  showRecordModal.value = true
}

const closeRecordModal = () => { showRecordModal.value = false }

const handleToggleClosed = async (record) => { await patientRecord.toggleRecordClosed(record) }

const confirmDelete = (record) => {
  recordToDelete.value = record
  showDeleteModal.value = true
}

const cancelDelete = () => {
  recordToDelete.value = null
  showDeleteModal.value = false
}

const handleDelete = async () => {
  if (recordToDelete.value) {
    const id = recordToDelete.value.id ?? recordToDelete.value.Id
    await patientRecord.deleteRecord(id)
    showDeleteModal.value = false
    recordToDelete.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>