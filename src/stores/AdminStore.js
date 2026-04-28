import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { apiFetch } from '@/api.js'

export const useAdminStore = defineStore('adminStore', () => {
  const authStore = useAuthStore()

  const isLoading = ref(false)
  const isSuccess = ref(false)
  const errorMessage = ref('')

  const formUpdate = ref({
    Username: '',
    Email: '',
    Password: '',
  })

  const resetForm = () => {
    formUpdate.value = { Username: '', Email: '', Password: '' }
    errorMessage.value = ''
    isSuccess.value = false
  }

  /**
   * Pre-fill the form with the nurse's current info.
   */
  const prefillForm = () => {
    const nurse = authStore.nurse
    formUpdate.value = {
      Username: nurse?.username || nurse?.Username || '',
      Email: nurse?.email || nurse?.Email || '',
      Password: '',
    }
    errorMessage.value = ''
    isSuccess.value = false
  }

  /**
   * PUT /api/Admin — update nurse credentials.
   * On success, syncs the updated data back into the authStore + localStorage.
   */
  const updateProfile = async () => {
    isLoading.value = true
    isSuccess.value = false
    errorMessage.value = ''

    try {
      const payload = {
        Username: formUpdate.value.Username,
        Email: formUpdate.value.Email,
        Password: formUpdate.value.Password,
      }

      // Remove empty password so the server keeps the existing one
      if (!payload.Password) delete payload.Password

      const response = await authStore.apiFetch('/api/Admin', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      if (!response) return false // apiFetch already handled 401

      if (response.ok) {
        // Sync updated values back into the auth store + localStorage
        const nurse = authStore.nurse
        const updated = {
          ...nurse,
          username: formUpdate.value.Username,
          Username: formUpdate.value.Username,
          email: formUpdate.value.Email,
          Email: formUpdate.value.Email,
        }
        authStore.nurse.value = updated
        // Update the pinia ref directly
        authStore.$patch({ nurse: updated })
        localStorage.setItem('nurse', JSON.stringify(updated))

        isSuccess.value = true
        formUpdate.value.Password = '' // clear password field after success
        return true
      } else {
        const data = await response.json().catch(() => ({}))
        errorMessage.value = data?.message || `Error: ${response.status}`
        return false
      }
    } catch (err) {
      console.error('Update profile error:', err)
      errorMessage.value = 'Something went wrong. Please try again.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    formUpdate,
    isLoading,
    isSuccess,
    errorMessage,
    prefillForm,
    resetForm,
    updateProfile,
  }
})
