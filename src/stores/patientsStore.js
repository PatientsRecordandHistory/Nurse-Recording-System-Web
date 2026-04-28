import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore.js'
import { usePatientRecord } from './patientRecord.js'
import { apiFetch } from '@/api.js'

export const usePatientStore = defineStore('patientStore', () => {
  const authStore = useAuthStore()
  const searchterm = ref('')
  const patients = ref([])

  const formErrors = ref({
    email: '',
    phone: '',
    duplicate: '',
  })

  const clearFormErrors = () => {
    formErrors.value = { email: '', phone: '', duplicate: '' }
  }

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

const normalizePatient = (p) => {
  // Extract the raw contact value first
  let contact = p.EmergencyContact ?? p.emergencyContact ?? ''
  
  // If the number starts with '0', convert it to '+63'
  if (String(contact).startsWith('0')) {
    contact = '+63' + String(contact).substring(1)
  }

  return {
    id: p.Id ?? p.id ?? null,
    Id: p.Id ?? p.id ?? null,
    firstname: p.Firstname ?? p.firstname ?? '',
    Firstname: p.Firstname ?? p.firstname ?? '',
    middlename: p.Middlename ?? p.middlename ?? '',
    Middlename: p.Middlename ?? p.middlename ?? '',
    lastname: p.Lastname ?? p.lastname ?? '',
    Lastname: p.Lastname ?? p.lastname ?? '',
    email: p.Email ?? p.email ?? '',
    Email: p.Email ?? p.email ?? '',
    address: p.Address ?? p.address ?? '',
    Address: p.Address ?? p.address ?? '',
    facebook: p.Facebook ?? p.facebook ?? '',
    Facebook: p.Facebook ?? p.facebook ?? '',
    emergencyContact: contact,
    EmergencyContact: contact,
    password: p.Password ?? p.password ?? '',
    Password: p.Password ?? p.password ?? '',
  }
}

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
    clearFormErrors()
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
    clearFormErrors()
  }

  watch(
  () => formPatient.value.emergencyContact,
  (newVal) => {
    if (newVal && String(newVal).startsWith('0')) {
      // Replaces the leading '0' with '+63'
      formPatient.value.emergencyContact = '+63' + String(newVal).substring(1)
    }
  }
)

const filteredpatients = computed(() => {
  const term = searchterm.value.toLowerCase().trim()
  if (!term) return patients.value

  return patients.value.filter((p) => {
    const fullName = `${p.firstname} ${p.middlename} ${p.lastname}`.toLowerCase()
    const email = (p.email || '').toLowerCase()
    const contact = String(p.emergencyContact || '')

    const searchContact = term.startsWith('0') ? '+63' + term.substring(1) : term

    return (
      fullName.includes(term) ||
      email.includes(term) ||
      contact.includes(term) ||
      contact.includes(searchContact)
    )
  })
})

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
      formErrors.value.duplicate = `A patient named ${newPatient.firstname} ${newPatient.lastname} already exists.`
      return false
    }
    formErrors.value.duplicate = ''
    return true
  }

  const deletePatient = async (id) => {
    const patientRecordStore = usePatientRecord()
    const hasRecords = patientRecordStore.patientRecords.some(
      (r) => String(r.patientId ?? r.PatientId) === String(id),
    )
    if (hasRecords) {
      return {
        success: false,
        blocked: true,
        reason: 'This patient has medical records. Please delete all records first before deleting this patient.',
      }
    }

    try {
      const response = await apiFetch(`/api/patients/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to delete patient')
      patients.value = patients.value.filter((p) => p.id !== id && p.Id !== id)
      console.log(`Patient with ID ${id} deleted`)
      return { success: true, blocked: false }
    } catch (error) {
      console.error('Error deleting patient:', error)
      return { success: false, blocked: false }
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

  const emailVerification = (patient) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (isEditMode.value) return true
    const emailExist = patients.value.some((p) => p.email && p.email === patient.email)
    if (patient.email && emailExist) {
      formErrors.value.email = 'This email is already in use.'
      return false
    }
    if (patient.email && !emailRegex.test(patient.email)) {
      formErrors.value.email = 'Invalid email format.'
      return false
    }
    formErrors.value.email = ''
    return true
  }

const phoneVerification = (newPatient) => {
  const phoneNumber = String(newPatient.emergencyContact ?? '')
  
  // If it starts with +63, it should be 13 characters (+63 + 10 digits)
  if (phoneNumber.startsWith('+63')) {
    if (phoneNumber.length !== 13) {
      formErrors.value.phone = 'Emergency contact must be +63 followed by 10 digits.'
      return false
    }
  } else {
    // Fallback validation if the watcher hasn't triggered or for different formats
    if (phoneNumber.length !== 11) {
      formErrors.value.phone = 'Emergency contact must be 11 digits starting with 0.'
      return false
    }
  }

  formErrors.value.phone = ''
  return true
}

  const submitPatient = async () => {
    clearFormErrors()
    if (
      !emailVerification(formPatient.value) |
      !phoneVerification(formPatient.value) |
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

  return {
    searchterm,
    patients,
    filteredpatients,
    formPatient,
    formErrors,
    isEditMode,
    deletePatient,
    setFormforEdit,
    submitPatient,
    resetForm,
    fetchPatients,
    normalizePatient,
    clearFormErrors,
  }
})