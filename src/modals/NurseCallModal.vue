<template>
  <Teleport to="body">
    <div
      v-if="alarmStore.isVisibleFor(deviceId)"
      class="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-poppins"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-8">
        <!-- Pulse icon -->
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-500"
          :class="iconBg"
        >
          <i
            class="fa-solid fa-phone-volume text-2xl transition-colors duration-500"
            :class="iconColor"
          ></i>
        </div>

        <!-- Badge -->
        <div class="text-center mb-3">
          <span class="inline-block text-xs font-semibold px-3 py-1 rounded-full" :class="badgeClass">
            {{ badgeText }}
          </span>
        </div>

        <!-- Device label -->
        <p class="text-xs text-center text-gray-400 mb-1">{{ deviceId }}</p>

        <!-- Title & message -->
        <h2 class="text-xl font-bold text-gray-800 text-center mb-2">{{ titleText }}</h2>
        <p class="text-sm text-gray-500 text-center mb-6 leading-relaxed">{{ messageText }}</p>

        <!-- calling -->
        <div v-if="callState === 'calling'" class="flex gap-3">
          <button
            @click="alarmStore.dismissCall(deviceId)"
            class="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
          >
            Dismiss
          </button>
          <button
            @click="alarmStore.setComing(deviceId)"
            class="flex-1 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-all hover:shadow-lg active:scale-95"
          >
            <i class="fa-solid fa-person-walking mr-1"></i>
            I'm coming
          </button>
        </div>

        <!-- coming -->
        <div v-if="callState === 'coming'" class="border-t border-gray-100 pt-4">
          <p class="text-xs text-gray-500 mb-2">
            Type <span class="font-bold text-gray-700">END CALL</span> to stop the buzzer
          </p>
          <div class="flex gap-2">
            <input
              v-model="endInput"
              type="text"
              placeholder="Type END CALL..."
              class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300"
              @keyup.enter="tryEndCall"
            />
            <button
              :disabled="endInput.trim().toUpperCase() !== 'END CALL'"
              @click="tryEndCall"
              class="px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
            >
              End call
            </button>
          </div>
        </div>

        <!-- ended -->
        <div v-if="callState === 'ended'">
          <button
            @click="closeModal"
            class="w-full py-3 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'                     // ← removed onMounted, onUnmounted
import { useAlarmStore } from '@/stores/alarmStore.js'

const props = defineProps({
  deviceId: {
    type: String,
    required: true,
  },
})

const alarmStore = useAlarmStore()
const endInput = ref('')

const callState = computed(() => alarmStore.callStateFor(props.deviceId))

const iconBg = computed(() => ({
  'bg-red-50 animate-pulse': callState.value === 'calling',
  'bg-green-50': callState.value === 'coming',
  'bg-blue-50': callState.value === 'ended',
}))

const iconColor = computed(() => ({
  'text-red-500': callState.value === 'calling',
  'text-green-600': callState.value === 'coming',
  'text-blue-500': callState.value === 'ended',
}))

const badgeClass = computed(() => ({
  'bg-red-100 text-red-700': callState.value === 'calling',
  'bg-green-100 text-green-700': callState.value === 'coming',
  'bg-blue-100 text-blue-700': callState.value === 'ended',
}))

const badgeText  = computed(() => ({ calling: 'Incoming call', coming: 'On my way',      ended: 'Call ended'    })[callState.value] ?? '')
const titleText  = computed(() => ({ calling: 'Patient is calling!', coming: 'Marked as coming', ended: 'Buzzer stopped' })[callState.value] ?? '')
const messageText = computed(() => ({
  calling: "Someone pressed the call button. Tap \"I'm coming\" to notify the patient.",
  coming:  'Patient notified. Buzzer stays active until you end the call below.',
  ended:   'Call has been ended. The Arduino buzzer will stop.',
})[callState.value] ?? '')

async function tryEndCall() {
  if (endInput.value.trim().toUpperCase() !== 'END CALL') return
  await alarmStore.endCall(props.deviceId)
  endInput.value = ''
}

async function closeModal() {
  await alarmStore.dismissCall(props.deviceId)
  endInput.value = ''
}

// Polling is handled globally in App.vue — nothing needed here
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
</style>