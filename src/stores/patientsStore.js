import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore.js'
import { apiFetch } from '@/api.js'

export const usePatientStore = defineStore('patientStore', () => {
  const authStore = useAuthStore()
  const searchterm = ref('')
  const patients = ref([])

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  /**
   * Normalize a patient from the API into a consistent shape that has BOTH
   * camelCase and PascalCase keys so every part of the UI works regardless
   * of which casing it references.
   */
  const normalizePatient = (p) => ({
    // Internal numeric id (always available)
    id: p.Id ?? p.id ?? null,
    Id: p.Id ?? p.id ?? null,

    // Name fields — both casings
    firstname: p.Firstname ?? p.firstname ?? '',
    Firstname: p.Firstname ?? p.firstname ?? '',
    middlename: p.Middlename ?? p.middlename ?? '',
    Middlename: p.Middlename ?? p.middlename ?? '',
    lastname: p.Lastname ?? p.lastname ?? '',
    Lastname: p.Lastname ?? p.lastname ?? '',

    // Contact / identity
    email: p.Email ?? p.email ?? '',
    Email: p.Email ?? p.email ?? '',
    address: p.Address ?? p.address ?? '',
    Address: p.Address ?? p.address ?? '',
    facebook: p.Facebook ?? p.facebook ?? '',
    Facebook: p.Facebook ?? p.facebook ?? '',
    emergencyContact: p.EmergencyContact ?? p.emergencyContact ?? '',
    EmergencyContact: p.EmergencyContact ?? p.emergencyContact ?? '',

    // Auth (never sent back to UI, just kept for store completeness)
    password: p.Password ?? p.password ?? '',
    Password: p.Password ?? p.password ?? '',
  })

  const fetchPatients = async () => {
    try {
      const response = await apiFetch('/api/patients', { headers: getHeaders() })
      if (!response.ok) throw new Error('Failed to fetch patients')
      const apiPatients = await response.json()
      patients.value = apiPatients.map(normalizePatient)
      console.log('Patients fetched successfully')
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) fetchPatients()
      else patients.value = []
    },
    { immediate: true },
  )

  const formPatient = ref({
    id: null,
    firstname: '',
    middlename: '',
    lastname: '',
    address: '',
    password: '',
    facebook: '',
    email: '',
    emergencyContact: '',
  })

  const resetForm = () => {
    formPatient.value = {
      id: null,
      firstname: '',
      middlename: '',
      lastname: '',
      address: '',
      password: '',
      facebook: '',
      email: '',
      emergencyContact: '',
    }
  }

  const isEditMode = computed(() => !!(formPatient.value.id || formPatient.value.Id))

  const setFormforEdit = (patient) => {
    formPatient.value = {
      id: patient.Id ?? patient.id,
      Id: patient.Id ?? patient.id,
      firstname: patient.Firstname ?? patient.firstname ?? '',
      middlename: patient.Middlename ?? patient.middlename ?? '',
      lastname: patient.Lastname ?? patient.lastname ?? '',
      address: patient.Address ?? patient.address ?? '',
      password: patient.Password ?? patient.password ?? '',
      facebook: patient.Facebook ?? patient.facebook ?? '',
      email: patient.Email ?? patient.email ?? '',
      emergencyContact: patient.EmergencyContact ?? patient.emergencyContact ?? '',
    }
  }

  const filteredpatients = computed(() => {
    const term = searchterm.value.toLowerCase()
    if (!term) return patients.value
    return patients.value.filter((patient) => {
      const fullName =
        `${patient.firstname} ${patient.middlename} ${patient.lastname}`.toLowerCase()
      return (
        fullName.includes(term) ||
        String(patient.email).toLowerCase().includes(term) ||
        String(patient.emergencyContact).toLowerCase().includes(term) ||
        String(patient.address).toLowerCase().includes(term)
      )
    })
  })

  /** Build PascalCase payload for the API */
  const buildPayload = (patient, includeId = false) => {
    const payload = {
      Firstname: patient.firstname ?? '',
      Middlename: patient.middlename ?? '',
      Lastname: patient.lastname ?? '',
      Address: patient.address ?? '',
      Password: patient.lastname ? patient.lastname.toUpperCase() : '',
      Facebook: patient.facebook ?? '',
      Email: patient.email ?? '',
      EmergencyContact: String(patient.emergencyContact ?? ''),
    }
    if (includeId) {
      payload.Id = patient.id ?? patient.Id
    }
    return payload
  }

  const addPatient = async (newPatient) => {
    try {
      const response = await apiFetch('/api/patients', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(buildPayload(newPatient, false)),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        throw new Error(`Failed to add patient: ${errorText}`)
      }
      const addedPatient = await response.json()
      patients.value.push(normalizePatient(addedPatient))
      console.log(`Patient ${addedPatient.Firstname} ${addedPatient.Lastname} added`)
      return true
    } catch (error) {
      console.error('Error adding patient:', error)
      return false
    }
  }

  const existingPatientDetails = (newPatient) => {
    const currentId = newPatient.id ?? newPatient.Id
    const patientExist = patients.value.some(
      (p) =>
        p.id !== currentId &&
        p.firstname?.toLowerCase() === newPatient.firstname?.toLowerCase() &&
        p.lastname?.toLowerCase() === newPatient.lastname?.toLowerCase() &&
        p.middlename?.toLowerCase() === newPatient.middlename?.toLowerCase(),
    )
    if (patientExist) {
      console.error(`Patient ${newPatient.firstname} ${newPatient.lastname} already exists`)
      return false
    }
    return true
  }

  const deletePatient = async (id) => {
    try {
      const response = await apiFetch(`/api/patients/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to delete patient')
      patients.value = patients.value.filter((p) => p.id !== id && p.Id !== id)
      console.log(`Patient with ID ${id} deleted`)
      return true
    } catch (error) {
      console.error('Error deleting patient:', error)
      return false
    }
  }

  const editPatient = async (id, updatedPatient) => {
    try {
      const payload = buildPayload(updatedPatient, true)
      const response = await apiFetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        throw new Error('Failed to update patient')
      }

      const responseText = await response.text()
      const updatedData = responseText
        ? normalizePatient(JSON.parse(responseText))
        : normalizePatient({ ...payload, Id: id })

      const index = patients.value.findIndex((p) => p.id == id || p.Id == id)
      if (index !== -1) {
        patients.value[index] = updatedData
        console.log(`Patient with ID ${id} updated`)
      }
      return true
    } catch (error) {
      console.error('Error updating patient:', error)
      return false
    }
  }

  const submitPatient = async () => {
    if (
      !emailVerification(formPatient.value) ||
      !phoneVerification(formPatient.value) ||
      !existingPatientDetails(formPatient.value)
    ) {
      return false
    }

    let success
    if (isEditMode.value) {
      success = await editPatient(formPatient.value.id ?? formPatient.value.Id, formPatient.value)
    } else {
      success = await addPatient(formPatient.value)
    }
    if (success) resetForm()
    return success
  }

  const emailVerification = (patient) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (isEditMode.value) return true
    const emailExist = patients.value.some((p) => p.email && p.email === patient.email)
    if (patient.email && emailExist) {
      console.error(`Email ${patient.email} already in use`)
      return false
    }
    if (patient.email && !emailRegex.test(patient.email)) {
      console.error(`Email ${patient.email} invalid format`)
      return false
    }
    return true
  }

  const phoneVerification = (newPatient) => {
    const phoneNumber = String(newPatient.emergencyContact ?? '')
    if (phoneNumber.length !== 11) {
      console.error(`Phone number should be 11 digits, got: ${phoneNumber}`)
      return false
    }
    return true
  }

  return {
    searchterm,
    patients,
    filteredpatients,
    formPatient,
    isEditMode,
    deletePatient,
    setFormforEdit,
    submitPatient,
    resetForm,
    fetchPatients,
    normalizePatient,
  }
})
