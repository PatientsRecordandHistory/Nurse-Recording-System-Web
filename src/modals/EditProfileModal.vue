<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-poppins"
    @click.self="handleClose"
  >
    <!-- Modal Card -->
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden"
    >
      <!-- Header -->
      <div
        class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#2933FF]/5 to-[#FF5451]/5"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2933FF] to-[#FF5451] flex items-center justify-center shadow-sm"
          >
            <i class="fa-solid fa-user-pen text-white text-sm"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Edit Profile</h3>
            <p class="text-xs text-gray-500">Update your account information</p>
          </div>
        </div>
        <button
          @click="handleClose"
          class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <i class="fa-solid fa-xmark text-gray-500 text-sm"></i>
        </button>
      </div>

      <!-- Avatar preview -->
      <div class="flex flex-col items-center pt-6 pb-2">
        <div
          class="w-16 h-16 rounded-full bg-gradient-to-r from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white font-bold text-xl shadow-lg mb-2"
        >
          {{ initials }}
        </div>
        <p class="text-sm font-semibold text-gray-700">{{ currentName }}</p>
        <p class="text-xs text-gray-400">{{ currentEmail }}</p>
      </div>

      <!-- Form -->
      <div class="px-6 pb-6 pt-4 space-y-4">
        <!-- Success banner -->
        <div
          v-if="store.isSuccess"
          class="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
        >
          <i class="fa-solid fa-circle-check text-green-500"></i>
          <p class="text-sm text-green-700 font-medium">Profile updated successfully!</p>
        </div>

        <!-- Error banner -->
        <div
          v-if="store.errorMessage"
          class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
        >
          <i class="fa-solid fa-circle-exclamation text-red-500"></i>
          <p class="text-sm text-red-700 font-medium">{{ store.errorMessage }}</p>
        </div>

        <!-- Username -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5 ml-1"> Username </label>
          <div class="relative">
            <div
              class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"
            >
              <i class="fa-solid fa-user text-[#2933FF] text-xs"></i>
            </div>
            <input
              v-model="store.formUpdate.Username"
              type="text"
              placeholder="Enter new username"
              class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#2933FF] focus:ring-2 focus:ring-[#2933FF]/20 transition-all"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
            Email Address
          </label>
          <div class="relative">
            <div
              class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"
            >
              <i class="fa-solid fa-envelope text-[#2933FF] text-xs"></i>
            </div>
            <input
              v-model="store.formUpdate.Email"
              type="email"
              placeholder="Enter new email"
              class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#2933FF] focus:ring-2 focus:ring-[#2933FF]/20 transition-all"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
            New Password
            <span class="text-gray-400 font-normal ml-1">(leave blank to keep current)</span>
          </label>
          <div class="relative">
            <div
              class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"
            >
              <i class="fa-solid fa-lock text-[#2933FF] text-xs"></i>
            </div>
            <input
              v-model="store.formUpdate.Password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter new password"
              class="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#2933FF] focus:ring-2 focus:ring-[#2933FF]/20 transition-all"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i
                :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                class="text-xs"
              ></i>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            @click="handleClose"
            class="flex-1 px-5 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-all hover:bg-gray-200 active:scale-95"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            :disabled="store.isLoading"
            class="flex-1 px-5 py-3 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <i v-if="store.isLoading" class="fa-solid fa-circle-notch fa-spin text-xs"></i>
            <i v-else class="fa-solid fa-floppy-disk text-xs"></i>
            {{ store.isLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/AdminStore'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits(['modalClose'])

const store = useAdminStore()
const authStore = useAuthStore()
const showPassword = ref(false)

// Derive display values from the live authStore nurse data
const currentName = computed(() => {
  const nurse = authStore.nurse
  return (
    nurse?.username ||
    nurse?.Username ||
    [nurse?.firstname || nurse?.Firstname, nurse?.lastname || nurse?.Lastname]
      .filter(Boolean)
      .join(' ') ||
    'Nurse User'
  )
})

const currentEmail = computed(() => {
  const nurse = authStore.nurse
  return nurse?.email || nurse?.Email || ''
})

const initials = computed(() => {
  const name = currentName.value
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
})

const handleSave = async () => {
  await store.updateProfile()
}

const handleClose = () => {
  store.resetForm()
  showPassword.value = false
  emit('modalClose')
}
</script>
