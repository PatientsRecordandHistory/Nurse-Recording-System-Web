// src/composables/useAppointmentReminder.js
// Polls every minute and fires an alarm + OS notification when an appointment
// is within 10 minutes (and hasn't already been alerted this session).

import { ref, onMounted, onUnmounted, isRef } from 'vue'
import { startAlarmSound, showAlarmNotification, requestNotificationPermission } from './useAlarmNotification'

/** How many minutes ahead to warn */
const WARN_MINUTES = 10

/** How many ms between checks (1 minute) */
const POLL_INTERVAL_MS = 60_000

/**
 * Set of appointment IDs that have already triggered an alert this session
 * so we don't spam repeatedly.
 */
const alertedIds = new Set()

/**
 * Parse an appointment into a JS Date.
 * appointment.date — ISO date string "YYYY-MM-DD"
 * appointment.time — "HH:mm" or "HH:mm:ss"
 */
function appointmentDate(appointment) {
  const date = appointment.date ?? appointment.Date ?? ''
  const time = appointment.time ?? appointment.Time ?? '00:00'
  if (!date) return null
  return new Date(`${date}T${time}`)
}

/**
 * Returns appointments whose time is between now and now + WARN_MINUTES,
 * excluding already-alerted ones and closed/expired ones.
 */
function getImminent(appointments) {
  const now = Date.now()
  const cutoff = now + WARN_MINUTES * 60 * 1000

  return appointments.filter((a) => {
    const id = a.id ?? a.Id
    if (alertedIds.has(id)) return false

    const isClosed = (a.status ?? a.Status) === 'Closed'
    if (isClosed) return false

    const dt = appointmentDate(a)
    if (!dt) return false

    const ms = dt.getTime()
    // Within the next 10 minutes (and not already past)
    return ms >= now && ms <= cutoff
  })
}

/**
 * Composable — call once in AppointmentView or App.vue.
 *
 * @param {Ref<Array>|Array} appointmentsRef — a reactive ref wrapping the
 *   appointments array (e.g. pass `store.appointments` directly from a Pinia
 *   store since Pinia state properties are already refs).
 *
 * ⚠️  IMPORTANT: Always pass the ref itself, NOT .value.
 *   ✅  useAppointmentReminder(store.appointments)
 *   ❌  useAppointmentReminder(store.appointments.value)  ← breaks reactivity
 *
 * Returns:
 *  - imminentAppointments  ref([]) — reactive list of soon appointments
 *  - dismissAlert(id)      — mark an alert dismissed for this session
 */
export function useAppointmentReminder(appointmentsRef) {
  const imminentAppointments = ref([])
  let stopCurrentAlarm = null
  let intervalId = null

  /**
   * Safely read the current appointment list.
   * Handles a ref<array> or (fallback) a plain array.
   */
  const getAppointments = () => {
    if (isRef(appointmentsRef)) return appointmentsRef.value ?? []
    return Array.isArray(appointmentsRef) ? appointmentsRef : []
  }

  const check = () => {
    const list = getAppointments()
    if (!list.length) return

    const imminent = getImminent(list)
    imminentAppointments.value = imminent

    if (imminent.length === 0) return

    // Fire one alarm sound burst (stop previous if still running)
    if (stopCurrentAlarm) {
      stopCurrentAlarm()
      stopCurrentAlarm = null
    }
    stopCurrentAlarm = startAlarmSound()
    // Auto-stop after 6 seconds — just a single alert burst
    setTimeout(() => {
      if (stopCurrentAlarm) {
        stopCurrentAlarm()
        stopCurrentAlarm = null
      }
    }, 6000)

    // Show an OS notification per imminent appointment
    imminent.forEach((a) => {
      const id = a.id ?? a.Id
      const patientName = a._patientName ?? 'Patient'
      const time = formatTime(a.time ?? a.Time ?? '')
      showAlarmNotification(
        `appointment-${id}`,
        '📅 Appointment in ~10 minutes',
        `${patientName} — ${a.reason ?? 'Visit'} at ${time}`,
      )
      // Mark as alerted AFTER firing so subsequent polls skip it
      alertedIds.add(id)
    })
  }

  const dismissAlert = (id) => {
    alertedIds.add(id)
    imminentAppointments.value = imminentAppointments.value.filter(
      (a) => (a.id ?? a.Id) !== id,
    )
  }

  onMounted(async () => {
    // Request permission first — browser requires a user-gesture context or
    // a trusted call early in the lifecycle; onMounted satisfies that.
    await requestNotificationPermission()

    // Run an immediate check once the list is populated.
    // We poll via setInterval instead of watch() to avoid the edge case where
    // the watcher fires on the raw ref object identity rather than its content
    // when the store replaces the array reference.  The interval is the source
    // of truth; on first mount we also fire right away after a short tick so
    // we catch any already-loaded appointments.
    setTimeout(check, 500)

    // Poll every minute regardless of list changes
    intervalId = setInterval(check, POLL_INTERVAL_MS)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
    if (stopCurrentAlarm) stopCurrentAlarm()
  })

  return { imminentAppointments, dismissAlert }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(timeString) {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`
}