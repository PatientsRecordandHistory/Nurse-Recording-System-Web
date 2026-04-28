import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePatientRecord } from './patientRecord'
import { usePatientStore } from './patientsStore'
import { useAuthStore } from './authStore'
import { useFollowupStore } from './FollowupStore'

export const usePrintStore = defineStore('printStore', () => {
  const patientRecordStore = usePatientRecord()
  const patientStore = usePatientStore()
  const authStore = useAuthStore()
  const followupStore = useFollowupStore()

  const selectedPatientId = ref(null)
  const selectedRecordId = ref(null)

  // Get patient details
  const patient = computed(() => {
    if (!selectedPatientId.value) return null
    return patientStore.patients.find((p) => p.id === selectedPatientId.value)
  })

  // Get specific record or all records for patient
  const records = computed(() => {
    if (!selectedPatientId.value) return []
    const allRecords = patientRecordStore.getpatient(selectedPatientId.value)
    if (selectedRecordId.value) {
      return allRecords.filter((r) => String(r.id ?? r.Id) === String(selectedRecordId.value))
    }
    return allRecords
  })

  // All follow-ups for the selected patient+record, sorted oldest → newest
  const recordFollowups = computed(() => {
    if (!selectedPatientId.value) return []
    return followupStore.followups
      .filter(
        (f) =>
          String(f.patientId) === String(selectedPatientId.value) &&
          (!selectedRecordId.value || String(f.recordId) === String(selectedRecordId.value)),
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  })

  // Most recent follow-up for the selected record
  const latestFollowup = computed(() => {
    const list = recordFollowups.value
    return list.length ? list[list.length - 1] : null
  })

  // Get current nurse information — handles multiple authStore shapes
  const nurse = computed(() => {
    // Try common property names your authStore might use
    return authStore.nurse ?? authStore.user ?? authStore.currentUser ?? null
  })

  // Nurse display name — tries every possible field name
  const nurseDisplayName = computed(() => {
    const n = nurse.value
    if (!n) return 'N/A'

    // Try full name fields first
    if (n.fullname) return n.fullname
    if (n.full_name) return n.full_name
    if (n.name) return n.name

    // Build from parts
    const first = n.firstname || n.Firstname || n.firstName || ''
    const last = n.lastname || n.Lastname || n.lastName || ''
    if (first || last) return `${first} ${last}`.trim()

    // Fallback to username or email
    return n.username || n.Username || n.email || n.Email || 'N/A'
  })

  // Nurse email
  const nurseEmail = computed(() => {
    const n = nurse.value
    if (!n) return ''
    return n.email || n.Email || ''
  })

  // Format today's date
  const todaysDate = computed(() => {
    const date = new Date()
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  // Format patient full name
  const patientFullName = computed(() => {
    if (!patient.value) return 'Unknown Patient'
    const p = patient.value
    const first = p.firstname || p.Firstname || ''
    const middle = p.middlename || p.Middlename || ''
    const last = p.lastname || p.Lastname || ''
    return `${first} ${middle ? middle + ' ' : ''}${last}`.trim() || 'Unknown Patient'
  })

  const setPrintData = (patientId, recordId = null) => {
    selectedPatientId.value = patientId
    selectedRecordId.value = recordId
  }

  const resetPrintData = () => {
    selectedPatientId.value = null
    selectedRecordId.value = null
  }

  const printDocument = () => {
    window.print()
  }

  return {
    selectedPatientId,
    selectedRecordId,
    patient,
    records,
    recordFollowups,
    latestFollowup,
    nurse,
    nurseDisplayName,
    nurseEmail,
    todaysDate,
    patientFullName,
    setPrintData,
    resetPrintData,
    printDocument,
  }
})