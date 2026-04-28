<template>
  <div class="min-h-screen flex font-poppins bg-[#F0F2FF] text-gray-900">
    <SidebarComponent />

    <div class="main flex-1 ml-[280px] p-10 overflow-auto">
      <!-- Back -->
      <button
        @click="goBack"
        class="mb-6 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:shadow-md transition-all flex items-center gap-2 text-sm"
      >
        <i class="fa-solid fa-arrow-left text-[#2933FF]"></i>
        Back to Records
      </button>

      <!-- Patient Header -->
      <div
        v-if="patient"
        class="bg-white rounded-2xl shadow-sm border border-white p-6 mb-6 flex items-center gap-5"
      >
        <div
          class="w-16 h-16 rounded-full bg-gradient-to-r from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0"
        >
          {{ patient.firstname?.[0] }}{{ patient.lastname?.[0] }}
        </div>
        <div>
          <h1
            class="text-2xl font-extrabold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
          >
            {{ patient.firstname }} {{ patient.middlename ? patient.middlename + ' ' : ''
            }}{{ patient.lastname }}
          </h1>
          <p class="text-sm text-gray-400 mt-0.5">
            Patient ID: #{{ patient.id }} · {{ patient.email || 'No email' }}
          </p>
        </div>
      </div>

      <!-- Record Detail Card -->
      <div
        v-if="record"
        class="bg-white rounded-2xl shadow-sm border border-white p-8 mb-6"
        :class="record.closed ? 'border-gray-200' : ''"
      >
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-r from-[#2933FF] to-[#FF5451] flex items-center justify-center shadow-md"
            >
              <i class="fa-solid fa-stethoscope text-white text-lg"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ record.diagnosis || 'No Diagnosis' }}
                </h2>
                <!-- Closed badge -->
                <span
                  v-if="record.closed"
                  class="text-xs font-bold px-2 py-1 rounded-full bg-gray-200 text-gray-600"
                >
                  <i class="fa-solid fa-lock mr-1 text-xs"></i>Closed
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5 font-mono">
                {{ record.recordId }} · {{ formatDate(record.date) }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="printRecord"
              class="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-semibold rounded-xl hover:bg-purple-200 transition-all flex items-center gap-2"
            >
              <i class="fa-solid fa-print"></i> Print
            </button>
            <button
              @click="openRecommendation"
              class="px-4 py-2 bg-gradient-to-r from-[#2933FF]/10 to-[#FF5451]/10 text-[#2933FF] text-sm font-semibold rounded-xl hover:shadow-md transition-all flex items-center gap-2"
            >
              <i class="fa-solid fa-file-medical"></i> Recommendation
            </button>
          </div>
        </div>

        <!-- Record Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="record-field">
            <p
              class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2"
            >
              <i class="fa-solid fa-user-injured text-[#2933FF]"></i> Symptoms
            </p>
            <div class="bg-[#F8F9FF] rounded-xl p-4 border border-[#E8EAFF]">
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ record.symptom || 'Not specified' }}
              </p>
            </div>
          </div>

          <div class="record-field">
            <p
              class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2"
            >
              <i class="fa-solid fa-stethoscope text-[#2933FF]"></i> Diagnosis
            </p>
            <div class="bg-[#F8F9FF] rounded-xl p-4 border border-[#E8EAFF]">
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ record.diagnosis || 'Not specified' }}
              </p>
            </div>
          </div>

          <div class="record-field">
            <p
              class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2"
            >
              <i class="fa-solid fa-pills text-[#FF5451]"></i> Treatment
            </p>
            <div class="bg-[#FFF8F8] rounded-xl p-4 border border-[#FFE8E8]">
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ record.treatment || 'Not specified' }}
              </p>
            </div>
          </div>

          <div class="record-field">
            <p
              class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2"
            >
              <i class="fa-solid fa-notes-medical text-[#FF5451]"></i> Notes
            </p>
            <div class="bg-[#FFF8F8] rounded-xl p-4 border border-[#FFE8E8]">
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ record.notes || 'No additional notes' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-white p-12 mb-6 text-center">
        <div
          class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"
        >
          <i class="fa-solid fa-folder-open text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500">Record not found</p>
      </div>

      <!-- Follow-ups Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-white p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              :class="
                record?.closed ? 'bg-gray-200' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              "
            >
              <i
                class="text-sm"
                :class="
                  record?.closed
                    ? 'fa-solid fa-lock text-gray-500'
                    : 'fa-solid fa-rotate-right text-white'
                "
              ></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">Follow-up Records</h3>
              <p class="text-xs text-gray-400">
                {{ recordFollowups.length }} follow-up{{ recordFollowups.length !== 1 ? 's' : '' }}
                for this record
              </p>
            </div>
          </div>

          <!-- Add follow-up — disabled when record is closed -->
          <div v-if="record?.closed" class="flex items-center gap-2">
            <span class="text-xs text-gray-400 font-medium">
              <i class="fa-solid fa-lock mr-1"></i>Record closed — no new follow-ups allowed
            </span>
          </div>
          <button
            v-else
            @click="openAddFollowupModal"
            class="px-5 py-2.5 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <i class="fa-solid fa-plus"></i>
            Add Follow-up
          </button>
        </div>

        <!-- Timeline of followups -->
        <div v-if="recordFollowups.length === 0" class="text-center py-12">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            :class="
              record?.closed ? 'bg-gray-100' : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10'
            "
          >
            <i
              class="text-2xl"
              :class="
                record?.closed
                  ? 'fa-solid fa-lock text-gray-400'
                  : 'fa-solid fa-rotate-right text-emerald-500'
              "
            ></i>
          </div>
          <p class="text-gray-500 text-sm">No follow-ups recorded yet</p>
          <p v-if="!record?.closed" class="text-gray-400 text-xs mt-1">
            Click "Add Follow-up" to record a follow-up visit
          </p>
          <p v-else class="text-gray-400 text-xs mt-1">
            Reopen the record from the records list to add follow-ups
          </p>
        </div>

        <div v-else class="relative">
          <div
            class="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2933FF] to-[#FF5451] opacity-20 z-0"
          ></div>

          <div class="space-y-6">
            <div
              v-for="(followup, index) in sortedFollowups"
              :key="followup.id"
              class="relative pl-16"
            >
              <div
                class="absolute left-4 top-5 w-5 h-5 rounded-full bg-gradient-to-r from-[#2933FF] to-[#FF5451] shadow-md z-10 flex items-center justify-center"
              >
                <div class="w-2 h-2 rounded-full bg-white"></div>
              </div>

              <div
                class="bg-[#F8F9FF] rounded-2xl border border-[#E8EAFF] p-6 hover:shadow-md transition-all"
              >
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <span
                      class="text-xs font-bold uppercase tracking-wider text-[#2933FF] bg-[#2933FF]/10 px-2 py-1 rounded-full"
                    >
                      Follow-up #{{ index + 1 }}
                    </span>
                    <p class="text-xs text-gray-400 mt-2">
                      <i class="fa-solid fa-calendar mr-1"></i>{{ formatDate(followup.date) }}
                    </p>
                  </div>

                  <!-- ✅ FIX: buttons are always visible, not hidden behind group-hover -->
                  <div v-if="!record?.closed" class="flex gap-2">
                    <button
                      @click="editFollowup(followup)"
                      class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:shadow-sm hover:border-[#2933FF]/30 transition-all"
                      title="Edit follow-up"
                    >
                      <i class="fa-solid fa-pen text-[#2933FF] text-xs"></i>
                    </button>
                    <button
                      @click="confirmDeleteFollowup(followup)"
                      class="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center hover:shadow-sm hover:border-red-300 transition-all"
                      title="Delete follow-up"
                    >
                      <i class="fa-solid fa-trash text-red-500 text-xs"></i>
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-if="followup.new_symptom">
                    <p class="text-xs font-bold text-orange-500 uppercase tracking-wide mb-1">
                      Updated Symptom
                    </p>
                    <p class="text-sm text-gray-700">{{ followup.new_symptom }}</p>
                  </div>

                  <div v-if="followup.new_diagnostic">
                    <p class="text-xs font-bold text-orange-500 uppercase tracking-wide mb-1">
                      Updated Diagnosis
                    </p>
                    <p class="text-sm text-gray-700">{{ followup.new_diagnostic }}</p>
                  </div>

                  <div v-if="followup.additional_treatment">
                    <p class="text-xs font-bold text-emerald-500 uppercase tracking-wide mb-1">
                      Additional Treatment
                    </p>
                    <p class="text-sm text-gray-700">{{ followup.additional_treatment }}</p>
                  </div>

                  <div v-if="followup.notes">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Notes
                    </p>
                    <p class="text-sm text-gray-700 italic">{{ followup.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FollowupModal
      v-if="showFollowupModal"
      :patientId="route.params.patientId"
      :recordId="route.params.recordId"
      :followupData="selectedFollowup"
      @modalClose="closeFollowupModal"
      @saved="handleFollowupSaved"
    />

    <div
      v-if="showDeleteFollowupModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-poppins"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <i class="fa-solid fa-exclamation-triangle text-xl text-red-500"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800">Delete Follow-up</h3>
            <p class="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p class="text-gray-600 mb-6">Are you sure you want to delete this follow-up record?</p>
        <div class="flex justify-end gap-3">
          <button
            @click="cancelDeleteFollowup"
            class="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            @click="handleDeleteFollowup"
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
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
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patientsStore'
import { usePatientRecord } from '@/stores/patientRecord'
import { useFollowupStore } from '@/stores/FollowupStore'
import { useAuthStore } from '@/stores/authStore'
import SidebarComponent from '@/components/SidebarComponent.vue'
import FollowupModal from '@/modals/FollowUpHandler.vue'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const recordStore = usePatientRecord()
const followupStore = useFollowupStore()
const authStore = useAuthStore()

provide('router', router)
provide('route', route)
provide('authStore', authStore)

const showFollowupModal = ref(false)
const showDeleteFollowupModal = ref(false)
const selectedFollowup = ref(null)
const followupToDelete = ref(null)

const patientId = computed(() => Number(route.params.patientId))
const recordId = computed(() => Number(route.params.recordId))

const patient = computed(() => patientStore.patients.find((p) => p.id === patientId.value))

const record = computed(() => recordStore.patientRecords.find((r) => r.id === recordId.value))

const recordFollowups = computed(() =>
  followupStore.followups.filter(
    (f) =>
      String(f.patientId) === String(patientId.value) &&
      String(f.recordId) === String(recordId.value),
  ),
)

const sortedFollowups = computed(() =>
  [...recordFollowups.value].sort((a, b) => new Date(b.date) - new Date(a.date)),
)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const goBack = () => router.push({ name: 'patientrecords', params: { id: patientId.value } })

const printRecord = () =>
  router.push({
    name: 'printview',
    params: { patientId: patientId.value, recordId: recordId.value },
  })

const openRecommendation = () =>
  router.push({
    name: 'recommendation',
    params: { patientId: patientId.value, recordId: recordId.value },
  })

const openAddFollowupModal = () => {
  if (record.value?.closed) return
  selectedFollowup.value = null
  followupStore.resetFollowupForm()
  followupStore.FollowupForm.patientId = String(patientId.value)
  followupStore.FollowupForm.recordId = String(recordId.value)
  followupStore.FollowupForm.date = new Date().toISOString().split('T')[0]
  showFollowupModal.value = true
}

const editFollowup = (followup) => {
  if (record.value?.closed) return
  selectedFollowup.value = followup
  followupStore.setFormforEdit(followup)
  showFollowupModal.value = true
}

const closeFollowupModal = () => {
  showFollowupModal.value = false
  selectedFollowup.value = null
}

const handleFollowupSaved = () => {
  followupStore.fetchFollowups()
  closeFollowupModal()
}

const confirmDeleteFollowup = (followup) => {
  followupToDelete.value = followup
  showDeleteFollowupModal.value = true
}

const cancelDeleteFollowup = () => {
  followupToDelete.value = null
  showDeleteFollowupModal.value = false
}

const handleDeleteFollowup = async () => {
  if (followupToDelete.value) {
    await followupStore.deleteFollowup(followupToDelete.value.id)
    showDeleteFollowupModal.value = false
    followupToDelete.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
</style>
