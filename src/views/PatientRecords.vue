<template>
  <div class="min-h-screen flex font-poppins bg-[#f8f9fc] text-gray-900">
    <SidebarComponent />

    <div class="main flex-1 ml-[280px] overflow-auto">

      <!-- Sticky top bar -->
      <div class="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-10 py-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <i class="fa-solid fa-arrow-left text-gray-600 text-sm"></i>
          </button>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {{ patientInitials }}
            </div>
            <div>
              <h1 class="text-base font-extrabold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent leading-tight">
                {{ patientFullName }}
              </h1>
              <p class="text-xs text-gray-400">Patient #{{ patientId }} · Medical Records</p>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="printAllRecords"
            class="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-xl hover:bg-purple-100 transition-all border border-purple-100"
          >
            <i class="fa-solid fa-print text-[10px]"></i>
            Print All
          </button>
          <button
            @click="openAddRecordModal"
            class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-xs font-semibold rounded-xl shadow hover:shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            <i class="fa-solid fa-plus text-[10px]"></i>
            New Record
          </button>
        </div>
      </div>

      <div class="p-10">

        <!-- Search -->
        <div class="relative mb-6">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search records by diagnosis, symptom, treatment..."
            class="w-full pl-11 pr-5 py-3 bg-white rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2933FF]/10 focus:border-[#2933FF] text-sm text-gray-700 placeholder-gray-300 transition-all"
          />
        </div>

        <!-- Empty state -->
        <div v-if="filteredRecords.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center mb-4">
            <i class="fa-solid fa-folder-open text-2xl text-[#2933FF]/50"></i>
          </div>
          <p class="text-gray-400 font-medium text-sm">No records found</p>
          <p class="text-gray-300 text-xs mt-1">Add a new record to get started</p>
        </div>

        <!-- Records List -->
        <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <!-- Table Header -->
          <div class="grid px-5 py-3 border-b border-gray-100 bg-gray-50/80" style="grid-template-columns: 2.5rem 2fr 1.4fr 1.2fr 8rem 7rem;">
            <div></div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Diagnosis</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Symptom</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Treatment</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</span>
          </div>

          <!-- Rows -->
          <div class="divide-y divide-gray-50">
            <div
              v-for="record in filteredRecords"
              :key="record.id"
              @click="goToFollowup(record)"
              class="group grid items-center px-5 py-4 transition-colors duration-150 cursor-pointer relative"
              :class="record.closed ? 'bg-gray-50/60 hover:bg-gray-100/60' : 'hover:bg-blue-50/40'"
              style="grid-template-columns: 2.5rem 2fr 1.4fr 1.2fr 8rem 7rem;"
            >
              <!-- Hover accent bar -->
              <div
                class="absolute left-0 top-2 bottom-2 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                :class="record.closed ? 'bg-gray-300' : 'bg-gradient-to-b from-[#2933FF] to-[#FF5451]'"
              ></div>

              <!-- Col 1: Icon -->
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="record.closed ? 'bg-gray-100' : 'bg-gradient-to-br from-[#2933FF]/15 to-[#FF5451]/15'"
              >
                <i
                  class="fa-solid fa-stethoscope text-[11px]"
                  :class="record.closed ? 'text-gray-400' : 'text-[#2933FF]'"
                ></i>
              </div>

              <!-- Col 2: Diagnosis + record ID -->
              <div class="min-w-0 pr-4">
                <div class="flex items-center gap-2">
                  <p
                    class="text-sm font-semibold truncate transition-colors"
                    :class="record.closed ? 'text-gray-400' : 'text-gray-800 group-hover:text-[#2933FF]'"
                  >
                    {{ record.diagnosis || 'No diagnosis' }}
                  </p>
                  <span
                    v-if="record.closed"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 text-[10px] font-semibold flex-shrink-0"
                  >
                    <i class="fa-solid fa-lock text-[8px]"></i> Closed
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-semibold flex-shrink-0 border border-emerald-100"
                  >
                    <i class="fa-solid fa-rotate-right text-[8px]"></i>
                    {{ getFollowupCount(record.id) }} follow-up{{ getFollowupCount(record.id) !== 1 ? 's' : '' }}
                  </span>
                </div>
                <p class="text-xs text-gray-400 font-mono mt-0.5">{{ record.recordId }}</p>
              </div>

              <!-- Col 3: Symptom -->
              <div class="min-w-0 pr-4">
                <p class="text-xs text-gray-500 truncate">{{ record.symptom || '—' }}</p>
              </div>

              <!-- Col 4: Treatment -->
              <div class="min-w-0 pr-4">
                <p class="text-xs text-gray-500 truncate">{{ record.treatment || '—' }}</p>
              </div>

              <!-- Col 5: Date -->
              <div class="flex items-center gap-1.5">
                <i class="fa-solid fa-calendar text-[9px] text-gray-300 flex-shrink-0"></i>
                <span class="text-xs text-gray-400">{{ formatDate(record.date) }}</span>
              </div>

              <!-- Col 6: Actions -->
              <div class="flex items-center gap-1 justify-end" @click.stop>
                <button
                  @click.stop="handleToggleClosed(record)"
                  class="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  :class="record.closed ? 'bg-green-50 hover:bg-green-100 border border-green-100' : 'bg-orange-50 hover:bg-orange-100 border border-orange-100'"
                  :title="record.closed ? 'Reopen Record' : 'Close Record'"
                >
                  <i
                    class="text-[10px]"
                    :class="record.closed ? 'fa-solid fa-lock-open text-green-600' : 'fa-solid fa-lock text-orange-500'"
                  ></i>
                </button>
                <button
                  @click.stop="printSingleRecord(record.id)"
                  class="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Print"
                >
                  <i class="fa-solid fa-print text-[10px] text-purple-600"></i>
                </button>
                <button
                  @click.stop="handleEdit(record)"
                  :disabled="record.closed"
                  class="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Edit"
                >
                  <i class="fa-solid fa-pen text-[10px] text-[#2933FF]"></i>
                </button>
                <button
                  @click.stop="confirmDelete(record)"
                  class="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Delete"
                >
                  <i class="fa-solid fa-trash text-[10px] text-red-500"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Footer count -->
          <div class="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p class="text-xs text-gray-400">
              Showing <span class="font-semibold text-gray-500">{{ filteredRecords.length }}</span> record{{ filteredRecords.length !== 1 ? 's' : '' }}
            </p>
          </div>
        </div>

      </div>
    </div>

    <RecordsHandler v-if="showRecordModal" @modalClose="closeRecordModal" />

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-poppins"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-gray-100 p-7">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          :class="deleteModal.blocked ? 'bg-orange-50' : 'bg-red-50'"
        >
          <i
            class="text-xl"
            :class="deleteModal.blocked ? 'fa-solid fa-ban text-orange-500' : 'fa-solid fa-triangle-exclamation text-red-500'"
          ></i>
        </div>

        <h3 class="text-lg font-bold text-gray-800 text-center mb-1">
          {{ deleteModal.blocked ? 'Cannot Delete Record' : 'Delete Record' }}
        </h3>
        <p class="text-xs text-gray-400 text-center mb-5">
          {{ deleteModal.blocked ? 'This record is linked to existing follow-ups.' : 'This action cannot be undone.' }}
        </p>

        <div v-if="deleteModal.blocked" class="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-5">
          <p class="text-xs text-orange-600 text-center font-medium">
            <i class="fa-solid fa-circle-info mr-1"></i>
            Please delete all follow-ups for this record first.
          </p>
        </div>

        <p v-else class="text-sm text-gray-500 text-center mb-5">
          Delete record for
          <span class="font-semibold text-gray-800">{{ recordToDelete?.diagnosis }}</span>?
        </p>

        <div class="flex gap-2.5">
          <button
            @click="cancelDelete"
            class="flex-1 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
          >
            {{ deleteModal.blocked ? 'Close' : 'Cancel' }}
          </button>
          <button
            v-if="!deleteModal.blocked"
            @click="handleDelete"
            class="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-md transition-all active:scale-95"
          >
            <i class="fa-solid fa-trash mr-1 text-xs"></i>Delete
          </button>
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
const deleteModal = ref({ blocked: false, reason: '' })

const patient = computed(() =>
  patientsStore.patients.find((p) => Number(p.id ?? p.Id) === patientId),
)

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
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const goBack = () => router.push({ name: 'home' })
const goToFollowup = (record) =>
  router.push({ name: 'record', params: { patientId, recordId: record.id } })
const printAllRecords = () => router.push({ name: 'printview', params: { patientId } })
const printSingleRecord = (recordId) =>
  router.push({ name: 'printview', params: { patientId, recordId } })

const openAddRecordModal = () => {
  patientRecord.resetRecordForm()
  showRecordModal.value = true
}

const handleEdit = (record) => {
  if (record.closed) return
  patientRecord.setFormforEdit(record)
  showRecordModal.value = true
}

const closeRecordModal = () => {
  showRecordModal.value = false
}

const handleToggleClosed = async (record) => {
  await patientRecord.toggleRecordClosed(record)
}

const confirmDelete = (record) => {
  recordToDelete.value = record
  const hasFollowups = followupStore.followups.some(
    (f) => Number(f.recordId ?? f.RecordId) === Number(record.id ?? record.Id)
  )
  deleteModal.value = { blocked: hasFollowups, reason: '' }
  showDeleteModal.value = true
}

const cancelDelete = () => {
  recordToDelete.value = null
  showDeleteModal.value = false
  deleteModal.value = { blocked: false, reason: '' }
}

const handleDelete = async () => {
  if (recordToDelete.value) {
    await patientRecord.deleteRecord(recordToDelete.value.id ?? recordToDelete.value.Id)
    showDeleteModal.value = false
    recordToDelete.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
</style>