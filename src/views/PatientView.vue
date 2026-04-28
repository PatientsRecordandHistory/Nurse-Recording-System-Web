<template>
  <div class="min-h-screen flex font-poppins bg-[#f8f9fc] text-gray-900">
    <SidebarComponent />

    <div class="main flex-1 ml-[280px] p-10 overflow-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8 gap-6">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent mb-1">
            Patient Management
          </h1>
          <p class="text-sm text-gray-400">Manage and view all registered patients</p>
        </div>
        <button
          @click="openAddPatientModal"
          class="px-6 py-3 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white rounded-xl shadow-md hover:shadow-lg hover:opacity-90 transition-all font-semibold text-sm flex items-center gap-2"
        >
          <i class="fa-solid fa-plus text-xs"></i>
          Add New Patient
        </button>
      </div>

      <!-- Search -->
      <div class="relative w-full mb-6">
        <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <i class="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
        </div>
        <input
          type="text"
          v-model="store.searchterm"
          placeholder="Search patient by name, email, or contact..."
          class="w-full pl-11 pr-5 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 shadow-sm outline-none focus:border-[#2933FF] focus:ring-2 focus:ring-[#2933FF]/10 transition"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="store.filteredpatients.length === 0"
        class="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm"
      >
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2933FF]/10 to-[#FF5451]/10 flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-users-slash text-2xl text-[#2933FF]/60"></i>
        </div>
        <p class="text-gray-400 text-sm">No patients found</p>
      </div>

      <!-- Patient Table -->
      <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <!-- Table Header -->
        <div class="grid px-5 py-3 border-b border-gray-100 bg-gray-50/80" style="grid-template-columns: 2.5rem 2fr 8rem 1.5fr 6rem;">
          <div></div>
          <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Name</span>
          <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Patient ID</span>
          <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Address</span>
          <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</span>
        </div>

        <!-- Table Rows -->
        <div class="divide-y divide-gray-50">
          <div
            v-for="patient in store.filteredpatients"
            :key="patient.id"
            @click="patientsrecord(patient.id)"
            class="group grid items-center px-5 py-3.5 hover:bg-blue-50/40 transition-colors duration-150 cursor-pointer relative"
            style="grid-template-columns: 2.5rem 2fr 8rem 1.5fr 6rem;"
          >
            <!-- Hover accent -->
            <div class="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-[#2933FF] to-[#FF5451] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

            <!-- Avatar -->
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2933FF]/15 to-[#FF5451]/15 flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-user text-[11px] text-[#2933FF]"></i>
            </div>

            <!-- Name + contact -->
            <div class="min-w-0 pr-4">
              <p class="text-sm font-semibold text-gray-800 truncate group-hover:text-[#2933FF] transition-colors">
                {{ patient.firstname }}{{ patient.middlename ? ' ' + patient.middlename : '' }} {{ patient.lastname }}
              </p>
              <div class="flex items-center gap-3 mt-0.5">
                <span class="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[160px]">
                  <i class="fa-solid fa-envelope text-[8px] text-[#FF5451]"></i>
                  {{ patient.email || '—' }}
                </span>
                <span class="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                  <i class="fa-solid fa-phone text-[8px] text-[#2933FF]"></i>
                  {{ patient.emergencyContact || '—' }}
                </span>
              </div>
            </div>

            <!-- ID Badge -->
            <div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-[#2933FF] text-xs font-mono font-medium border border-indigo-100">
                <i class="fa-solid fa-id-badge text-[9px]"></i>
                #{{ patient.id }}
              </span>
            </div>

            <!-- Address -->
            <div class="text-sm text-gray-500 flex items-center gap-1.5 min-w-0 pr-4">
              <i class="fa-solid fa-location-dot text-[10px] text-[#FF5451] flex-shrink-0"></i>
              <span class="truncate">{{ patient.address || '—' }}</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1.5 justify-end" @click.stop>
              <button
                @click.stop="handleEdit(patient)"
                class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-blue-100"
                title="Edit"
              >
                <i class="fa-solid fa-pen text-[10px] text-[#2933FF]"></i>
              </button>
              <button
                @click.stop="confirmDelete(patient)"
                class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-red-100"
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
            Showing <span class="font-semibold text-gray-500">{{ store.filteredpatients.length }}</span> patient{{ store.filteredpatients.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

    </div>

    <PatientHandlerModal v-if="showPatientModal" @modalClose="closePatientModal" />

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
          {{ deleteModal.blocked ? 'Cannot Delete Patient' : 'Delete Patient' }}
        </h3>
        <p class="text-xs text-gray-400 text-center mb-5">
          {{ deleteModal.blocked ? 'This patient has existing medical records.' : 'This action cannot be undone.' }}
        </p>

        <div v-if="deleteModal.blocked" class="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-5">
          <p class="text-xs text-orange-600 text-center font-medium">
            <i class="fa-solid fa-circle-info mr-1"></i>
            Please delete all medical records for this patient first.
          </p>
        </div>

        <p v-else class="text-sm text-gray-500 text-center mb-5">
          Are you sure you want to delete
          <span class="font-semibold text-gray-800">{{ patientToDelete?.firstname }} {{ patientToDelete?.lastname }}</span>?
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
import { ref, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePatientStore } from '@/stores/patientsStore'
import { usePatientRecord } from '@/stores/patientRecord'
import { useAuthStore } from '@/stores/authStore'
import SidebarComponent from '@/components/SidebarComponent.vue'
import PatientHandlerModal from '@/modals/PatientHandler.vue'

const store = usePatientStore()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

provide('router', router)
provide('route', route)
provide('authStore', authStore)

const showPatientModal = ref(false)
const showDeleteModal = ref(false)
const patientToDelete = ref(null)
const deleteModal = ref({ blocked: false, reason: '' })

const patientsrecord = (id) => router.push({ name: 'patientrecords', params: { id } })

const openAddPatientModal = () => {
  store.resetForm()
  showPatientModal.value = true
}

const handleEdit = (patient) => {
  store.setFormforEdit(patient)
  showPatientModal.value = true
}

const closePatientModal = () => {
  showPatientModal.value = false
}

const confirmDelete = (patient) => {
  patientToDelete.value = patient
  const patientRecordStore = usePatientRecord()
  const hasRecords = patientRecordStore.patientRecords.some(
    (r) => String(r.patientId ?? r.PatientId) === String(patient.id ?? patient.Id)
  )
  deleteModal.value = { blocked: hasRecords, reason: '' }
  showDeleteModal.value = true
}

const cancelDelete = () => {
  patientToDelete.value = null
  showDeleteModal.value = false
  deleteModal.value = { blocked: false, reason: '' }
}

const handleDelete = async () => {
  if (patientToDelete.value) {
    await store.deletePatient(patientToDelete.value.id ?? patientToDelete.value.Id)
    showDeleteModal.value = false
    patientToDelete.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
</style>