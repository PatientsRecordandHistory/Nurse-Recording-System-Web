<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-poppins"
    @click.self="$emit('cancel')"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-8">
      <!-- Icon -->
      <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
        <i class="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
      </div>

      <!-- Title -->
      <h2 class="text-xl font-bold text-gray-800 text-center mb-2">{{ title }}</h2>
      <p class="text-sm text-gray-500 text-center mb-6 leading-relaxed">{{ message }}</p>

      <!-- Blocked reason -->
      <div v-if="blocked" class="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
        <p class="text-sm text-red-600 text-center font-medium">
          <i class="fa-solid fa-ban mr-1"></i>
          {{ blockedReason }}
        </p>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          class="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
        >
          <i class="fa-solid fa-xmark mr-1"></i>
          {{ blocked ? 'Close' : 'Cancel' }}
        </button>
        <button
          v-if="!blocked"
          @click="$emit('confirm')"
          class="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95"
        >
          <i class="fa-solid fa-trash mr-1"></i>
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Confirm Delete' },
  message: { type: String, default: 'Are you sure you want to delete this?' },
  blocked: { type: Boolean, default: false },
  blockedReason: { type: String, default: '' },
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
</style>