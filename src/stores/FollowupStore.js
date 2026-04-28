import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore.js'
import { apiFetch } from '@/api.js'

export const useFollowupStore = defineStore('followupStore', () => {
  const authStore = useAuthStore()
  const followups = ref([])

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const normalizeFollowup = (f) => ({
    ...f,
    id: f.id ?? f.Id,
    patientId: f.patientId ?? f.PatientId,
    recordId: f.recordId ?? f.RecordId,
    date: f.date ?? f.Date,
    diagnosis: f.diagnosis ?? f.Diagnosis ?? '',
    new_diagnostic: f.new_diagnostic ?? f.New_Diagnostic ?? '',
    symptom: f.symptom ?? f.Symptom ?? '',
    new_symptom: f.new_symptom ?? f.New_Symptom ?? '',
    treatment: f.treatment ?? f.Treatment ?? '',
    additional_treatment: f.additional_treatment ?? f.Additional_Treatment ?? '',
    notes: f.notes ?? f.Notes ?? '',
  })

  const buildFollowupPayload = (data, idOverride = null) => {
    const patientId = Number(
      data.patientId ?? data.PatientId ?? data.patient?.id ?? data.Patient?.Id ?? 0,
    )
    const patient = data.patient ?? data.Patient ?? (patientId ? { Id: patientId } : null)

    return {
      Id: idOverride ?? data.id ?? data.Id ?? 0,
      PatientId: patientId,
      RecordId: Number(data.recordId ?? data.RecordId ?? 0),
      Patient: patient,
      Date: data.date ?? data.Date,
      Diagnosis: data.diagnosis ?? data.Diagnosis ?? '',
      New_Diagnostic: data.new_diagnostic ?? data.New_Diagnostic ?? '',
      Symptom: data.symptom ?? data.Symptom ?? '',
      New_Symptom: data.new_symptom ?? data.New_Symptom ?? '',
      Treatment: data.treatment ?? data.Treatment ?? '',
      Additional_Treatment: data.additional_treatment ?? data.Additional_Treatment ?? '',
      Notes: data.notes ?? data.Notes ?? '',
    }
  }

  const fetchFollowups = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      followups.value = []
      return
    }

    try {
      const response = await apiFetch('/api/followups', {
        headers: getHeaders(),
      })

      if (response.status === 401) {
        console.warn('Unauthorized when fetching follow-ups. Token may be missing/expired.')
        followups.value = []
        return
      }

      if (!response.ok) throw new Error('Failed to fetch follow-ups')

      const apiFollowups = await response.json()
      followups.value = apiFollowups.map(normalizeFollowup)
      console.log('Follow-ups fetched successfully')
    } catch (error) {
      console.error('Error fetching follow-ups:', error)
    }
  }

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) fetchFollowups()
      else followups.value = []
    },
    { immediate: true },
  )

  const FollowupForm = ref({
    id: null,
    patientId: '',
    recordId: '',
    date: '',
    diagnosis: '',
    new_diagnostic: '',
    symptom: '',
    new_symptom: '',
    treatment: '',
    additional_treatment: '',
    notes: '',
  })

  const resetFollowupForm = () => {
    FollowupForm.value = {
      id: null,
      patientId: '',
      recordId: '',
      date: '',
      diagnosis: '',
      new_diagnostic: '',
      symptom: '',
      new_symptom: '',
      treatment: '',
      additional_treatment: '',
      notes: '',
    }
  }

  const addFollowup = async (newFollowup) => {
    try {
      const payload = buildFollowupPayload(newFollowup, 0)
      const response = await apiFetch('/api/followups', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to add follow-up: ${errorText}`)
      }

      const addedFollowup = await response.json()
      followups.value.push(normalizeFollowup(addedFollowup))
      console.log('Follow-up added successfully:', addedFollowup)
      return true
    } catch (error) {
      console.error('Error adding follow-up:', error)
      return false
    }
  }

  const deleteFollowup = async (id) => {
    const numericId = Number(id)
    const followup = followups.value.find((f) => Number(f.id ?? f.Id) === numericId)
    if (!followup) {
      console.error('Follow-up not found:', id)
      return false
    }

    try {
      const response = await apiFetch(`/api/followups/${numericId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to delete follow-up')

      followups.value = followups.value.filter((f) => Number(f.id ?? f.Id) !== numericId)
      return true
    } catch (error) {
      console.error('Error deleting follow-up:', error)
      return false
    }
  }

  const isEditMode = computed(
    () => FollowupForm.value.id !== null && FollowupForm.value.id !== undefined,
  )

  const setFormforEdit = (followup) => {
    FollowupForm.value = { ...normalizeFollowup(followup) }
  }

  const editFollowup = async (id, updatedFollowup) => {
    const serverID = Number(id)
    const payload = buildFollowupPayload(updatedFollowup, serverID)

    try {
      const response = await apiFetch(`/api/followups/${serverID}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update follow-up: ${errorText}`)
      }

      let updatedData = payload
      const responseText = await response.text()
      if (responseText) {
        updatedData = JSON.parse(responseText)
      }

      const index = followups.value.findIndex((f) => Number(f.id ?? f.Id) === serverID)
      if (index !== -1) {
        followups.value[index] = normalizeFollowup(updatedData)
      }
      return true
    } catch (error) {
      console.error('Error updating follow-up:', error)
      return false
    }
  }

  const submitFollowupForm = async () => {
    if (isEditMode.value) {
      return await editFollowup(FollowupForm.value.id, FollowupForm.value)
    }

    const payload = { ...FollowupForm.value }
    delete payload.id
    return await addFollowup(payload)
  }

  return {
    followups,
    FollowupForm,
    isEditMode,
    fetchFollowups,
    resetFollowupForm,
    setFormforEdit,
    submitFollowupForm,
    deleteFollowup,
  }
})
