import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './authStore.js'
import * as signalR from '@microsoft/signalr'
import {
  startAlarmSound,
  showAlarmNotification,
  requestNotificationPermission,
} from '@/composables/useAlarmNotification.js'
import { apiFetch } from '@/api.js'

export const useAlarmStore = defineStore('alarmStore', () => {
  const authStore = useAuthStore()
  const devices = ref({})

  const alarmStopFns = {}

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const getDeviceState = (deviceId) => {
    if (!devices.value[deviceId]) devices.value[deviceId] = { rawState: 0 }
    return devices.value[deviceId]
  }

  const callStateFor = (deviceId) => {
    const map = { 0: 'idle', 1: 'calling', 2: 'coming', 3: 'ended' }
    return map[getDeviceState(deviceId).rawState] || 'idle'
  }

  const isVisibleFor = (deviceId) => {
    const s = getDeviceState(deviceId).rawState
    return s >= 1 && s <= 3
  }

  // ── Normalise state from either backend ──────────────────────────
  // Old backend sends State as string: "Idle","Calling","Coming","Ended"
  // New backend sends State as int:     0, 1, 2, 3
  const normaliseState = (raw) => {
    if (typeof raw === 'number') return raw
    const map = { idle: 0, calling: 1, coming: 2, ended: 3 }
    return map[String(raw).toLowerCase()] ?? 0
  }

  // ── Sound helpers ─────────────────────────────────────────────────
  const stopAlarm = (deviceId) => {
    if (alarmStopFns[deviceId]) {
      alarmStopFns[deviceId]()
      delete alarmStopFns[deviceId]
    }
  }

  const triggerSound = (deviceId) => {
    if (alarmStopFns[deviceId]) return
    try {
      alarmStopFns[deviceId] = startAlarmSound()
    } catch {
      // AudioContext blocked — start on first gesture
      const resume = () => {
        if (!alarmStopFns[deviceId]) {
          try {
            alarmStopFns[deviceId] = startAlarmSound()
          } catch {}
        }
        document.removeEventListener('click', resume)
        document.removeEventListener('keydown', resume)
      }
      document.addEventListener('click', resume)
      document.addEventListener('keydown', resume)
    }
  }

  // ── Handle any incoming alarm payload ────────────────────────────
  const handleAlarm = (alarm, showNotif = true) => {
    const id = alarm.DeviceId ?? alarm.deviceId
    if (id == null) return

    const prev = getDeviceState(id).rawState
    const next = normaliseState(alarm.State ?? alarm.state ?? 0)

    getDeviceState(id).rawState = next

    if (next === 1 && prev !== 1) {
      triggerSound(id)
      if (showNotif) {
        showAlarmNotification(
          id,
          '🔔 Nurse Call — Patient Needs Help',
          `Device ${id}: Patient pressed the call button.`,
          () => window.focus(),
        )
      }
    } else if (prev === 1 && next !== 1) {
      stopAlarm(id)
    }
  }

  // ── SignalR hub connection ────────────────────────────────────────
  let connection = null

  const buildConnection = () => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    return new signalR.HubConnectionBuilder()
      .withUrl(`${base}/alarmhub`, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()
  }

  const startListening = async () => {
    if (connection) return

    await requestNotificationPermission()

    connection = buildConnection()

    // New backend
    connection.on('AlarmUpdated', (alarm) => handleAlarm(alarm, true))

    // Old backend (State is string here)
    connection.on('ReceiveStateChange', (alarm) => handleAlarm(alarm, true))

    // Snapshot — no notification, just restore state + sound if needed
    connection.on('AlarmSnapshot', (alarms) => {
      const list = Array.isArray(alarms) ? alarms : [alarms]
      list.forEach((alarm) => handleAlarm(alarm, false))
    })

    try {
      await connection.start()
      console.log('[AlarmStore] SignalR connected')
    } catch (err) {
      console.error('[AlarmStore] SignalR connection failed:', err)
    }
  }

  const stopListening = async () => {
    Object.keys(alarmStopFns).forEach(stopAlarm)
    if (connection) {
      await connection.stop()
      connection = null
    }
    devices.value = {}
  }

  // ── Actions (REST PATCH) ─────────────────────────────────────────
  const updateAlarmState = async (deviceId, newState) => {
    try {
      const response = await apiFetch(`/api/Alarm/${deviceId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ State: newState }),
      })
      if (!response.ok) throw new Error('Failed to update alarm')
      getDeviceState(deviceId).rawState = newState
      return true
    } catch (error) {
      console.error('Error updating alarm:', error)
      return false
    }
  }

  const setComing = (deviceId) => updateAlarmState(deviceId, 2)
  const dismissCall = (deviceId) => updateAlarmState(deviceId, 0)
  const endCall = (deviceId) => updateAlarmState(deviceId, 3)

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (!isAuth) stopListening()
    },
    { immediate: true },
  )

  return {
    devices,
    callStateFor,
    isVisibleFor,
    startListening,
    stopListening,
    setComing,
    dismissCall,
    endCall,
  }
})
