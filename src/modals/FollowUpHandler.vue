<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-poppins"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-gray-100"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl z-10">
        <div class="flex items-center justify-between">
          <div>
            <h2
              class="text-2xl font-bold bg-gradient-to-r from-[#2933FF] to-[#FF5451] bg-clip-text text-transparent"
            >
              {{ store.isEditMode ? 'Edit Follow-up' : 'New Follow-up' }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              {{
                store.isEditMode ? 'Update follow-up details below' : 'Record a new follow-up visit'
              }}
            </p>
          </div>
          <button
            @click="closeModal"
            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-110 active:scale-95"
          >
            <i class="fa-solid fa-xmark text-gray-600"></i>
          </button>
        </div>
      </div>

      <div class="p-6 space-y-5">
        <!-- Date -->
<div class="form-group">
  <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
    <i class="fa-solid fa-calendar text-[#2933FF]"></i>
    Follow-up Date:
  </label>
  <input
    type="date"
    v-model="store.FollowupForm.date"
    :min="minDate"
    required
    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all text-gray-800"
  />
</div>

        <!-- ── Previous context (read-only) ─────────────────────────────── -->
        <div class="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
          <p
            class="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2"
          >
            <i class="fa-solid fa-clock-rotate-left text-gray-400"></i>
            Previous record context (read-only)
          </p>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">Previous Symptom</p>
              <div
                class="bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 min-h-[56px]"
              >
                {{ previousContext.symptom || '—' }}
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1">Previous Diagnosis</p>
              <div
                class="bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 min-h-[56px]"
              >
                {{ previousContext.diagnosis || '—' }}
              </div>
            </div>
            <div class="col-span-2">
              <p class="text-xs font-semibold text-gray-500 mb-1">Previous Treatment</p>
              <div
                class="bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 min-h-[40px]"
              >
                {{ previousContext.treatment || '—' }}
              </div>
            </div>
          </div>
        </div>
        <!-- ──────────────────────────────────────────────────────────────── -->

        <!-- New Symptom -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-plus-circle text-orange-500"></i>
            New / Updated Symptom:
          </label>
          <textarea
            v-model="store.FollowupForm.new_symptom"
            rows="3"
            placeholder="Any new or changed symptoms..."
            class="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
          ></textarea>
        </div>

        <!-- Updated Diagnosis -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-plus-circle text-orange-500"></i>
            Updated Diagnosis:
          </label>
          <textarea
            v-model="store.FollowupForm.new_diagnostic"
            rows="3"
            placeholder="Revised or new diagnostic..."
            class="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
          ></textarea>
        </div>

        <!-- Additional Treatment -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-plus-circle text-emerald-500"></i>
            Additional Treatment:
          </label>
          <textarea
            v-model="store.FollowupForm.additional_treatment"
            rows="3"
            placeholder="New or additional treatments..."
            class="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
          ></textarea>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-notes-medical text-[#2933FF]"></i>
            Notes:
          </label>
          <textarea
            v-model="store.FollowupForm.notes"
            rows="3"
            placeholder="Additional observations or instructions..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 focus:border-transparent transition-all resize-none text-gray-800 placeholder-gray-400"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            @click="closeModal"
            type="button"
            class="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-all hover:bg-gray-200 active:scale-95"
          >
            <i class="fa-solid fa-xmark mr-1"></i>
            Cancel
          </button>
          <button
            @click="submitHandler"
            type="button"
            class="px-6 py-3 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <i class="fa-solid fa-check mr-1"></i>
            {{ store.isEditMode ? 'Update Follow-up' : 'Save Follow-up' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFollowupStore } from '@/stores/FollowupStore'
import { usePatientRecord } from '@/stores/patientRecord'

const store = useFollowupStore()
const recordStore = usePatientRecord()

const props = defineProps({
  patientId: [String, Number],
  recordId: [String, Number],
  followupData: Object,
})

const emit = defineEmits(['modalClose', 'saved'])

/**
 * Build previous context from:
 *  1. The original record (symptom / diagnosis / treatment)
 *  2. The most-recent existing follow-up's new_symptom / new_diagnostic / additional_treatment
 *     (if there is one — i.e. a second+ follow-up)
 */
const previousContext = computed(() => {
  const record = recordStore.patientRecords.find(
    (r) => String(r.id ?? r.Id) === String(props.recordId),
  )

  // All follow-ups for this record, sorted oldest → newest
  const followups = store.followups
    .filter(
      (f) =>
        String(f.patientId) === String(props.patientId) &&
        String(f.recordId) === String(props.recordId),
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // If editing, exclude the current follow-up from context lookback
  const currentId = store.FollowupForm?.id
  const previousFollowups = currentId
    ? followups.filter((f) => String(f.id) !== String(currentId))
    : followups

  const latest = previousFollowups.length ? previousFollowups[previousFollowups.length - 1] : null

  if (latest) {
    return {
      symptom: latest.new_symptom || latest.symptom || record?.symptom || '',
      diagnosis: latest.new_diagnostic || latest.diagnosis || record?.diagnosis || '',
      treatment: latest.additional_treatment || latest.treatment || record?.treatment || '',
    }
  }

  return {
    symptom: record?.symptom || '',
    diagnosis: record?.diagnosis || '',
    treatment: record?.treatment || '',
  }
})

const minDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const closeModal = () => emit('modalClose')

const submitHandler = async () => {
  const success = await store.submitFollowupForm()
  if (success) {
    emit('saved')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
</style>
