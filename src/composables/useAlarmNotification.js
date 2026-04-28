// src/composables/useAlarmNotification.js
// Handles browser (OS) notifications + Web Audio alarm sound
// when a nurse-call device transitions into "calling" state.

let audioCtx = null
let alarmNodes = [] // keep refs so we can stop them

// ── Audio ─────────────────────────────────────────────────────────────────────

function getAudioCtx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

/**
 * Plays a looping hospital-style beep alarm.
 * Returns a stop() function.
 */
export function startAlarmSound() {
  const ctx = getAudioCtx()

  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume()

  const stopFns = []

  // Three-beep repeating pattern using OscillatorNode + GainNode scheduling
  const BEEP_HZ = 880 // A5 — sharp, attention-grabbing
  const BEEP_HZ2 = 1100 // slightly higher for second tone
  const REPEAT_INTERVAL = 1.8 // seconds between pattern starts
  const PATTERN = [
    { freq: BEEP_HZ, start: 0.0, dur: 0.12 },
    { freq: BEEP_HZ, start: 0.18, dur: 0.12 },
    { freq: BEEP_HZ2, start: 0.36, dur: 0.22 },
  ]

  let running = true
  let patternStart = ctx.currentTime + 0.05

  function schedulePattern(baseTime) {
    if (!running) return

    PATTERN.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, baseTime + start)

      // Envelope: quick attack, flat sustain, short release
      gain.gain.setValueAtTime(0, baseTime + start)
      gain.gain.linearRampToValueAtTime(0.55, baseTime + start + 0.01)
      gain.gain.setValueAtTime(0.55, baseTime + start + dur - 0.02)
      gain.gain.linearRampToValueAtTime(0, baseTime + start + dur)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(baseTime + start)
      osc.stop(baseTime + start + dur + 0.05)

      alarmNodes.push({ osc, gain })
    })

    // Schedule next repetition
    const nextStart = baseTime + REPEAT_INTERVAL
    const delay = (nextStart - ctx.currentTime) * 1000
    const tid = setTimeout(() => schedulePattern(nextStart), Math.max(0, delay - 50))
    stopFns.push(() => clearTimeout(tid))
  }

  schedulePattern(patternStart)

  return function stop() {
    running = false
    stopFns.forEach((fn) => fn())
    alarmNodes.forEach(({ osc, gain }) => {
      try {
        osc.stop()
        osc.disconnect()
        gain.disconnect()
      } catch (_) {
        /* already stopped */
      }
    })
    alarmNodes = []
  }
}

// ── Browser (OS) Notification ─────────────────────────────────────────────────

let notifPermission = Notification.permission

export async function requestNotificationPermission() {
  if (notifPermission === 'granted') return true
  if (notifPermission === 'denied') return false
  try {
    notifPermission = await Notification.requestPermission()
    return notifPermission === 'granted'
  } catch {
    return false
  }
}

/**
 * Shows a Windows-style OS notification.
 * @param {string} deviceId
 * @param {string} [title]
 * @param {string} [body]
 * @param {function} [onClick] — called when user clicks the notification
 * @returns {Notification|null}
 */
export function showAlarmNotification(deviceId, title, body, onClick) {
  if (Notification.permission !== 'granted') return null

  const notif = new Notification(title ?? '🔔 Nurse Call Alert', {
    body: body ?? `Patient on ${deviceId} pressed the call button. Tap to respond.`,
    icon: '/favicon.ico', // swap with your app icon path
    badge: '/favicon.ico',
    tag: `nurse-call-${deviceId}`, // deduplicate: replaces previous notif for same device
    requireInteraction: true, // stays until user interacts (like Windows persistent notif)
    silent: false, // OS plays its own subtle sound on top of ours
  })

  if (onClick) notif.onclick = onClick
  return notif
}

// ── Composable ────────────────────────────────────────────────────────────────

/**
 * Call once at app startup (e.g. App.vue) so the user grants notification
 * permission on the first real interaction.
 */
export function useAlarmNotification() {
  return { requestNotificationPermission, showAlarmNotification, startAlarmSound }
}
