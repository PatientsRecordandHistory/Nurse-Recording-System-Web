<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAlarmStore } from '@/stores/alarmStore.js'
import NurseCallModal from '@/modals/NurseCallModal.vue'

const alarmStore = useAlarmStore() // ← this was missing

onMounted(() => alarmStore.startListening())
onUnmounted(() => alarmStore.stopListening())
</script>

<template>
  <header></header>
  <NurseCallModal
    v-for="(_, deviceId) in alarmStore.devices"
    :key="deviceId"
    :deviceId="deviceId"
  />
  <RouterView />
</template>
