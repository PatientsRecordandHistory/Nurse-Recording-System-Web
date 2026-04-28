import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { usePatientStore } from './patientsStore'
import { useAuthStore } from './authStore.js'
import { apiFetch } from '@/api.js'

export const useAppointmentStore = defineStore('appointmentStore', () => {
  const patientStore = usePatientStore()
  const authStore = useAuthStore()
  const appointments = ref([])

  // ── Auto-close interval ────────────────────────────────────────────────────
  let autoCloseIntervalId = null

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const patientSearchTerm = ref('')
  const selectedPatientId = ref(null)

  const appointmentsForm = ref({
    id: null,
    appointmentId: null,
    patientId: null,
    date: '',
    time: '',
    reason: '',
  })

  const generateAppointmentId = () => {
    if (appointments.value.length === 0) return 'P-001'
    const last = appointments.value.reduce(
      (latest, current) => {
        if (!latest.appointmentId || !current.appointmentId) return latest
        const latestNum = parseInt(latest.appointmentId.split('-')[1])
        const currentNum = parseInt(current.appointmentId.split('-')[1])
        return currentNum > latestNum ? current : latest
      },
      { appointmentId: 'P-000' },
    )
    const nextNumber = parseInt(last.appointmentId.split('-')[1]) + 1
    return 'P-' + String(nextNumber).padStart(3, '0')
  }

  const resetForm = () => {
    appointmentsForm.value = {
      id: null,
      appointmentId: null,
      patientId: null,
      date: '',
      time: '',
      reason: '',
    }
    selectedPatientId.value = null
    patientSearchTerm.value = ''
  }

  const isEditMode = computed(() => !!appointmentsForm.value.id)

  /** Search patients using normalized (lowercase) fields */
  const filteredPatients = computed(() => {
    if (!patientSearchTerm.value?.trim()) return []
    const term = patientSearchTerm.value.toLowerCase().trim()
    return patientStore.patients.filter((patient) => {
      const fullName =
        `${patient.firstname ?? ''} ${patient.middlename ?? ''} ${patient.lastname ?? ''}`.toLowerCase()
      const contact = String(patient.emergencyContact ?? patient.EmergencyContact ?? '')
      const email = String(patient.email ?? patient.Email ?? '').toLowerCase()
      return fullName.includes(term) || contact.includes(term) || email.includes(term)
    })
  })

  /** The currently selected patient object (normalized) */
  const selectedPatient = computed(() => {
    if (!selectedPatientId.value) {
      appointmentsForm.value.patientId = null
      return null
    }
    const patient = patientStore.patients.find(
      (p) => String(p.id ?? p.Id) === String(selectedPatientId.value),
    )
    if (patient) appointmentsForm.value.patientId = patient.id ?? patient.Id
    return patient ?? null
  })

  /** Strip any ISO time suffix, returning only "YYYY-MM-DD" */
  const normalizeDate = (raw) => {
    if (!raw) return ''
    return String(raw).split('T')[0]
  }

  /** Ensure time is "HH:mm" — strips seconds if present e.g. "14:30:00" → "14:30" */
  const normalizeTime = (raw) => {
    if (!raw) return '00:00'
    const parts = String(raw).split(':')
    return `${parts[0].padStart(2, '0')}:${(parts[1] ?? '00').padStart(2, '0')}`
  }

  const normalizeAppointment = (a) => ({
    ...a,
    id: a.id ?? a.Id,
    appointmentId: a.appointmentId ?? a.AppointmentId,
    patientId: a.patientId ?? a.PatientId,
    date: normalizeDate(a.date ?? a.Date),
    time: normalizeTime(a.time ?? a.Time),
    reason: a.reason ?? a.Reason,
    status: a.status ?? a.Status,
    _patientName: resolvePatientName(a.patientId ?? a.PatientId),
  })

  function resolvePatientName(patientId) {
    if (!patientId) return 'Unknown Patient'
    const p = patientStore.patients.find((pt) => String(pt.id ?? pt.Id) === String(patientId))
    if (!p) return 'Unknown Patient'
    const first = p.firstname ?? p.Firstname ?? ''
    const last = p.lastname ?? p.Lastname ?? ''
    return `${first} ${last}`.trim() || 'Unknown Patient'
  }

  const buildAppointmentPayload = (formData, appointmentIdOverride = null) => {
    const patient = patientStore.patients.find(
      (p) => String(p.id ?? p.Id) === String(selectedPatientId.value ?? formData.patientId),
    )
    const patientId = Number(selectedPatientId.value ?? formData.patientId ?? 0)

    return {
      Id: formData.id || 0,
      AppointmentId: appointmentIdOverride ?? formData.appointmentId ?? '',
      PatientId: patientId,
      Patient: patient
        ? {
            Id: patient.id ?? patient.Id,
            Firstname: patient.firstname ?? patient.Firstname ?? '',
            Middlename: patient.middlename ?? patient.Middlename ?? '',
            Lastname: patient.lastname ?? patient.Lastname ?? '',
            Address: patient.address ?? patient.Address ?? '',
            Password: patient.password ?? patient.Password ?? '',
            Facebook: patient.facebook ?? patient.Facebook ?? '',
            Email: patient.email ?? patient.Email ?? '',
            EmergencyContact: patient.emergencyContact ?? patient.EmergencyContact ?? '',
          }
        : null,
      Date: formData.date,
      Time: formData.time,
      Reason: formData.reason,
      Status: formData.status || 'Pending',
    }
  }

  const selectPatient = (patient) => {
    selectedPatientId.value = patient.id ?? patient.Id
    patientSearchTerm.value = ''
  }

  const fetchAppointments = async () => {
    try {
      const response = await apiFetch('/api/appointments', { headers: getHeaders() })
      if (!response.ok) throw new Error('Failed to fetch appointments')
      const apiAppointments = await response.json()
      appointments.value = apiAppointments.map(normalizeAppointment)
      console.log('Appointments fetched successfully')
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  /**
   * Checks all non-Closed appointments and marks any whose date+time has
   * already passed as "Closed" — both locally and via the API (PUT request).
   *
   * Key fixes:
   * - Uses full date+time comparison (not just date) to avoid premature closure.
   * - Updates local ref optimistically so the UI responds immediately.
   * - Builds a minimal, correct PUT payload directly here instead of reusing
   *   buildAppointmentPayload (which depends on selectedPatientId state that
   *   may not be set during background polling).
   * - Reverts the optimistic update if the API call fails.
   */
  const autoCloseExpiredAppointments = async () => {
const now = Date.now();
  const GRACE_PERIOD_MS = 5 * 60 * 1000; // 5-minute grace period

  const toClose = appointments.value.filter((a) => {
    if (a.status === 'Closed') return false;

    const date = a.date || '';
    const time = a.time || '00:00';
    if (!date) return false;

    // FIX: Use a space instead of 'T' to ensure the browser parses this as LOCAL time
    const dt = new Date(`${date} ${time}`); 
    if (isNaN(dt.getTime())) return false;

    // Match backend logic: only close if it's older than 5 minutes ago
    return (dt.getTime() + GRACE_PERIOD_MS) < now;
  })

    if (toClose.length === 0) return

    console.log(`Auto-closing ${toClose.length} expired appointment(s)…`)

    // ── Optimistic local update first so the UI reflects it immediately ──────
    toClose.forEach((a) => {
      const id = a.id ?? a.Id
      const idx = appointments.value.findIndex((x) => (x.id ?? x.Id) === id)
      if (idx !== -1) {
        appointments.value[idx] = { ...appointments.value[idx], status: 'Closed' }
      }
    })

    // ── Then persist each closure to the API ─────────────────────────────────
    await Promise.all(
      toClose.map(async (a) => {
        const id = Number(a.id ?? a.Id)
        const originalStatus = a.status ?? a.Status ?? 'Pending'

        // Build the PUT payload directly — do NOT rely on selectedPatientId
        // since this runs in a background interval with no UI context.
        const patientId = Number(a.patientId ?? a.PatientId ?? 0)
        const patient = patientStore.patients.find(
          (p) => Number(p.id ?? p.Id) === patientId,
        )
        const payload = {
          Id: id,
          AppointmentId: a.appointmentId ?? a.AppointmentId ?? '',
          PatientId: patientId,
          Patient: patient
            ? {
                Id: patient.id ?? patient.Id,
                Firstname: patient.firstname ?? patient.Firstname ?? '',
                Middlename: patient.middlename ?? patient.Middlename ?? '',
                Lastname: patient.lastname ?? patient.Lastname ?? '',
                Address: patient.address ?? patient.Address ?? '',
                Password: patient.password ?? patient.Password ?? '',
                Facebook: patient.facebook ?? patient.Facebook ?? '',
                Email: patient.email ?? patient.Email ?? '',
                EmergencyContact: patient.emergencyContact ?? patient.EmergencyContact ?? '',
              }
            : null,
          Date: a.date ?? a.Date,
          Time: a.time ?? a.Time,
          Reason: a.reason ?? a.Reason ?? '',
          Status: 'Closed',
        }

        try {
          const response = await apiFetch(`/api/appointments/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload),
          })

          if (response.ok) {
            console.log(`✓ Auto-closed appointment #${id}`)
          } else {
            const errText = await response.text().catch(() => response.status)
            console.warn(`✗ Failed to auto-close appointment #${id}: ${errText} — reverting`)
            // Revert optimistic update on failure
            const idx = appointments.value.findIndex((x) => (x.id ?? x.Id) === id)
            if (idx !== -1) {
              appointments.value[idx] = { ...appointments.value[idx], status: originalStatus }
            }
          }
        } catch (err) {
          console.error(`✗ Network error auto-closing appointment #${id}:`, err)
          // Revert on network error too
          const idx = appointments.value.findIndex((x) => (x.id ?? x.Id) === id)
          if (idx !== -1) {
            appointments.value[idx] = { ...appointments.value[idx], status: originalStatus }
          }
        }
      }),
    )
  }

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) {
        fetchAppointments()
        // Poll every minute for appointments that have crossed into the past
        autoCloseIntervalId = setInterval(autoCloseExpiredAppointments, 60_000)
      } else {
        appointments.value = []
        if (autoCloseIntervalId) {
          clearInterval(autoCloseIntervalId)
          autoCloseIntervalId = null
        }
      }
    },
    { immediate: true },
  )

  // Re-resolve patient names whenever the patients list loads/changes.
  // Also triggers auto-close here — guarantees patientStore.patients is
  // populated before we try to look up Patient objects for the PUT payload.
  watch(
    () => patientStore.patients,
    (patients) => {
      appointments.value = appointments.value.map((a) => ({
        ...a,
        _patientName: resolvePatientName(a.patientId),
      }))
      if (patients.length > 0) {
        autoCloseExpiredAppointments()
      }
    },
  )

  const addAppointment = async (appointmentData) => {
    try {
      const newAppointmentId = generateAppointmentId()
      const payload = buildAppointmentPayload(appointmentData, newAppointmentId)
      const response = await apiFetch('/api/appointments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to add appointment')
      const newAppointment = await response.json()
      appointments.value.push(normalizeAppointment(newAppointment))
      resetForm()
      return true
    } catch (error) {
      console.error('Error adding appointment:', error)
      return false
    }
  }

  const editAppointment = async (id, updatedAppointment) => {
    try {
      const payload = buildAppointmentPayload(updatedAppointment, updatedAppointment.appointmentId)
      const response = await apiFetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to update appointment')

      const updatedData =
        response.status === 204 ? { ...updatedAppointment } : await response.json()
      const index = appointments.value.findIndex((a) => Number(a.id ?? a.Id) === Number(id))
      if (index !== -1) {
        appointments.value[index] = normalizeAppointment(updatedData)
        resetForm()
      }
      return true
    } catch (error) {
      console.error('Error updating appointment:', error)
      return false
    }
  }

  const submitAppointment = async () => {
    const form = appointmentsForm.value
    if (!form.date || !form.time || !form.reason || !form.patientId) {
      console.error('Date, Time, Reason, and a Patient are required.')
      return false
    }
    if (isEditMode.value) {
      form.patientId = selectedPatientId.value
      return await editAppointment(form.id, form)
    }
    return await addAppointment(form)
  }

  const setFormforEdit = (appointment) => {
    appointmentsForm.value = { ...appointment }
    selectedPatientId.value = appointment.patientId ?? appointment.PatientId
    patientSearchTerm.value = ''
  }

  const deleteAppointment = async (id) => {
    try {
      const response = await apiFetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!response.ok) throw new Error('Failed to delete appointment')
      appointments.value = appointments.value.filter((a) => Number(a.id ?? a.Id) !== Number(id))
      return true
    } catch (error) {
      console.error('Error deleting appointment:', error)
      return false
    }
  }

  return {
    appointments,
    appointmentsForm,
    selectedPatientId,
    selectedPatient,
    patientSearchTerm,
    filteredPatients,
    isEditMode,
    selectPatient,
    fetchAppointments,
    submitAppointment,
    setFormforEdit,
    deleteAppointment,
    resetForm,
    editAppointment,
    resolvePatientName,
  }
})