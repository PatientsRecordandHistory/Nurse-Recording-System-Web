<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-poppins"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-gray-100"
    >
      <div class="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl z-10">
        <div class="flex items-center justify-between">
          <div>
            <h2
              class="text-2xl font-bold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
            >
              {{ store.isEditMode ? 'Update Patient' : 'Add New Patient' }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              {{
                store.isEditMode
                  ? 'Update patient information below'
                  : 'Fill in patient details to register'
              }}
            </p>
          </div>
          <button
            @click="closeModal"
            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-110 active:scale-95"
            title="Close"
          >
            <i class="fa-solid fa-xmark text-gray-600"></i>
          </button>
        </div>
      </div>

      <form @submit.prevent="submitHandler" class="p-6 space-y-5">
        <div class="grid grid-cols-2 gap-5">
          <div class="form-group">
            <label
              for="firstname"
              class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <i class="fa-solid fa-user text-[#2933FF]"></i>
              First Name:
            </label>
            <input
              type="text"
              id="firstname"
              v-model="store.formPatient.firstname"
              placeholder="Enter first name"
              autocomplete="off"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div class="form-group">
            <label
              for="lastname"
              class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <i class="fa-solid fa-user text-[#FF5451]"></i>
              Last Name:
            </label>
            <input
              type="text"
              id="lastname"
              v-model="store.formPatient.lastname"
              placeholder="Enter last name"
              autocomplete="off"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div class="form-group">
          <label
            for="middlename"
            class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <i class="fa-solid fa-user-tag text-[#2933FF]"></i>
            Middle Name:
          </label>
          <input
            type="text"
            id="middlename"
            v-model="store.formPatient.middlename"
            placeholder="Enter middle name"
            autocomplete="off"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div class="form-group">
          <label
            for="email"
            class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <i class="fa-solid fa-envelope text-[#FF5451]"></i>
            Email Address:
          </label>
          <input
            type="email"
            id="email"
            v-model="store.formPatient.email"
            placeholder="patient@example.com"
            autocomplete="off"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div class="form-group">
          <label
            for="emergencyContact"
            class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <i class="fa-solid fa-phone text-[#2933FF]"></i>
            Emergency Contact:
          </label>
          <input
            type="text"
            id="emergencyContact"
            v-model="store.formPatient.emergencyContact"
            placeholder="09123456789"
            autocomplete="off"
            required
            maxlength="11"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div class="form-group">
          <label
            for="address"
            class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <i class="fa-solid fa-location-dot text-[#FF5451]"></i>
            Address:
          </label>
          <textarea
            id="address"
            v-model="store.formPatient.address"
            placeholder="Enter complete address"
            rows="3"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all duration-300 resize-none text-gray-800 placeholder-gray-400"
          ></textarea>
        </div>

        <div class="form-group">
          <label
            for="facebook"
            class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <i class="fa-brands fa-facebook text-[#2933FF]"></i>
            Facebook (Optional):
          </label>
          <input
            type="text"
            id="facebook"
            v-model="store.formPatient.facebook"
            placeholder="Facebook profile/username"
            autocomplete="off"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div class="form-group">
          <label
            for="password"
            class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
          >
            <i class="fa-solid fa-lock text-[#FF5451]"></i>
            Password:
          </label>
          <input
            type="password"
            id="password"
            v-model="store.formPatient.password"
            placeholder="Enter secure password"
            autocomplete="off"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            @click="closeModal"
            type="button"
            class="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-all hover:bg-gray-200 hover:shadow-md active:scale-95"
          >
            <i class="fa-solid fa-xmark mr-1"></i>
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-3 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <i class="fa-solid fa-check mr-1"></i>
            {{ store.isEditMode ? 'Update Patient' : 'Add Patient' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { usePatientStore } from '@/stores/patientsStore'

const store = usePatientStore()
const emit = defineEmits(['modalClose'])

const closeModal = () => {
  emit('modalClose')
}

const submitHandler = async () => {
  const success = await store.submitPatient()
  if (success) {
    closeModal()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
</style>