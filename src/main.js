import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Start the token-expiry watcher after Pinia is ready
import { useAuthStore } from './stores/authStore.js'
const authStore = useAuthStore()
authStore.startExpiryWatcher()

app.mount('#app')
