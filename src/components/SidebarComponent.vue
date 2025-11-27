<template>
  <div class="sidebar-container h-screen bg-white shadow-2xl flex flex-col font-poppins">
    <!-- Logo Section -->
    <div class="logo-section p-6 border-b border-gray-200">
      <div class="flex items-center gap-3 mb-2">
        <div class="gradient-logo w-12 h-12"></div>
        <div>
          <h1
            class="text-2xl font-extrabold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
          >
            ACLC CLINIC
          </h1>
          <p class="text-xs text-gray-500">Healthcare System</p>
        </div>
      </div>
    </div>

    <!-- User Profile Section -->
    <div class="user-profile p-6 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 rounded-full bg-gradient-to-r from-[#2933FF] to-[#FF5451] flex items-center justify-center text-white font-bold shadow-lg"
        >
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-bold text-gray-800 truncate">{{ userName }}</h3>
          <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto p-4">
      <div class="space-y-2">
        <a
          v-for="item in navigationItems"
          :key="item.name"
          @click.prevent="navigateTo(item.path)"
          href="#"
          class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2933FF]/10 hover:to-[#FF5451]/10 group"
          :class="{ 'active-nav-item': isActive(item.path) }"
        >
          <span
            class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors"
          >
            <i
              :class="item.icon"
              class="text-gray-600 group-hover:bg-gradient-to-r group-hover:from-[#2933FF] group-hover:to-[#FF5451] group-hover:bg-clip-text group-hover:text-transparent"
            ></i>
          </span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-800 group-hover:text-[#2933FF]">
              {{ item.name }}
            </p>
            <p class="text-xs text-gray-500">{{ item.description }}</p>
          </div>
        </a>
      </div>
    </nav>

    <!-- Logout Button -->
    <div class="logout-section p-4 border-t border-gray-200">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95"
      >
        <span class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <i class="fa-solid fa-right-from-bracket"></i>
        </span>
        <div class="flex-1 text-left">
          <p class="text-sm font-semibold">Logout</p>
          <p class="text-xs opacity-80">End your session</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

// Use inject to get router and route from parent
const router = inject('router')
const route = inject('route') 
const authStore = inject('authStore')

const navigationItems = [
  {
    name: 'Patients',
    path: '/',
    icon: 'fa-solid fa-users',
    description: 'Manage patients',
  },
  {
    name: 'Appointments',
    path: '/appointments',
    icon: 'fa-solid fa-calendar-check',
    description: 'Schedule & view',
  },
]

const userName = computed(() => {
  return authStore?.nurse?.username || 'Nurse User'
})

const userEmail = computed(() => {
  return authStore?.nurse?.email || 'nurse@aclc.com'
})

const userInitials = computed(() => {
  const name = userName.value
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const isActive = (path) => {
  if (!route) return false
  return route.path === path
}

const navigateTo = (path) => {
  if (router) {
    router.push(path)
  }
}

const handleLogout = async () => {
  if (authStore) {
    await authStore.logout()
  }
  if (router) {
    router.push({ name: 'login' })
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.sidebar-container {
  width: 280px;
  position: fixed;
  left: 0;
  top: 0;
}

.gradient-logo {
  mask: url('/images/ACLC.svg') center / contain no-repeat;
  -webkit-mask: url('/images/ACLC.svg') center / contain no-repeat;
  background: linear-gradient(135deg, #2933ff, #ff5451);
  background-size: 200% 200%;
  display: inline-block;
}

.active-nav-item {
  background: linear-gradient(to right, rgba(41, 51, 255, 0.1), rgba(255, 84, 81, 0.1));
  border-left: 4px solid #2933ff;
}

.nav-item:hover {
  transform: translateX(4px);
}
</style>