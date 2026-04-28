<template>
  <div class="recommendation-container font-poppins">
    <!-- Screen View (with buttons and editable form) -->
    <div
      class="screen-only bg-gradient-to-br from-gray-50 via-blue-50/30 to-red-50/20 min-h-screen p-8"
    >
      <div class="max-w-5xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <button
            @click="goBack"
            class="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            <i class="fa-solid fa-arrow-left"></i>
            Back
          </button>
          <button
            @click="print"
            class="px-6 py-3 bg-gradient-to-r from-[#2933FF] to-[#FF5451] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <i class="fa-solid fa-print"></i>
            Print Recommendation
          </button>
        </div>

        <!-- Editable Form Preview -->
        <div class="recommendation-content bg-white shadow-2xl p-12">
          <!-- Header -->
          <div class="header text-center mb-12 pb-8 border-b-2 border-gray-300">
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="gradient-logo w-20 h-20"></div>
            </div>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">ACLC CLINIC</h1>
            <p class="text-gray-600 text-sm">Healthcare Management System</p>
            <p class="text-gray-500 text-xs mt-2">Patient Transfer Recommendation</p>
          </div>

          <!-- Document Type Banner -->
          <div class="mb-8 text-center">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">PATIENT TRANSFER RECOMMENDATION</h2>
            <p class="text-gray-600">Date Issued: {{ printStore.todaysDate }}</p>
          </div>

          <!-- Patient Information Section -->
          <div class="patient-section mb-8 bg-gray-50 p-6 rounded-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
              PATIENT INFORMATION
            </h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600 font-semibold mb-1">Full Name:</p>
                <p class="text-gray-800">{{ printStore.patientFullName }}</p>
              </div>
              <div>
                <p class="text-gray-600 font-semibold mb-1">Patient ID:</p>
                <p class="text-gray-800">#{{ printStore.patient?.id || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-gray-600 font-semibold mb-1">Contact Number:</p>
                <p class="text-gray-800">{{ printStore.patient?.emergencyContact || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-gray-600 font-semibold mb-1">Email Address:</p>
                <p class="text-gray-800">{{ printStore.patient?.email || 'N/A' }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-gray-600 font-semibold mb-1">Address:</p>
                <p class="text-gray-800">{{ printStore.patient?.address || 'Not Provided' }}</p>
              </div>
            </div>
          </div>

          <!-- Medical Summary Section -->
          <div class="medical-summary mb-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
              MEDICAL SUMMARY
            </h3>
            <div v-if="printStore.records.length > 0" class="bg-gray-50 p-6 rounded-lg">
              <div class="space-y-4">
                <div>
                  <p class="font-semibold text-gray-700 mb-1">Recent Diagnosis:</p>
                  <p class="text-gray-800">
                    {{ printStore.records[0]?.diagnosis || 'Not Specified' }}
                  </p>
                </div>
                <div>
                  <p class="font-semibold text-gray-700 mb-1">Symptoms:</p>
                  <p class="text-gray-800">
                    {{ printStore.records[0]?.symptom || 'Not Specified' }}
                  </p>
                </div>
                <div>
                  <p class="font-semibold text-gray-700 mb-1">Current Treatment:</p>
                  <p class="text-gray-800">
                    {{ printStore.records[0]?.treatment || 'Not Specified' }}
                  </p>
                </div>
                <!-- Latest follow-up summary -->
                <div
                  v-if="printStore.latestFollowup"
                  class="pt-3 border-t border-gray-200 col-span-2"
                >
                  <p
                    class="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1"
                  >
                    <i class="fa-solid fa-rotate-right"></i> Latest Follow-up
                    <span class="text-gray-400 font-normal normal-case ml-1">
                      {{ formatDate(printStore.latestFollowup.date) }}
                    </span>
                  </p>
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div v-if="printStore.latestFollowup.new_symptom">
                      <p class="font-semibold text-orange-600 mb-0.5">Updated Symptom:</p>
                      <p class="text-gray-700">{{ printStore.latestFollowup.new_symptom }}</p>
                    </div>
                    <div v-if="printStore.latestFollowup.new_diagnostic">
                      <p class="font-semibold text-orange-600 mb-0.5">Updated Diagnosis:</p>
                      <p class="text-gray-700">{{ printStore.latestFollowup.new_diagnostic }}</p>
                    </div>
                    <div v-if="printStore.latestFollowup.additional_treatment" class="col-span-2">
                      <p class="font-semibold text-emerald-700 mb-0.5">Additional Treatment:</p>
                      <p class="text-gray-700">
                        {{ printStore.latestFollowup.additional_treatment }}
                      </p>
                    </div>
                    <div v-if="printStore.latestFollowup.notes" class="col-span-2">
                      <p class="font-semibold text-gray-500 mb-0.5">Notes:</p>
                      <p class="text-gray-600 italic">{{ printStore.latestFollowup.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p class="text-yellow-800 text-sm flex items-center gap-2">
                <i class="fa-solid fa-exclamation-triangle"></i>
                No recent medical records available. Please update patient records before transfer.
              </p>
            </div>
          </div>

          <!-- Editable Transfer Recommendation Details -->
          <div class="transfer-details mb-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
              TRANSFER RECOMMENDATION
            </h3>
            <div class="space-y-4">
              <div class="bg-gray-50 p-5 rounded-lg">
                <label class="block font-semibold text-gray-700 mb-2">Reason for Transfer:</label>
                <textarea
                  v-model="form.transferReason"
                  rows="3"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 text-sm text-gray-800"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 p-5 rounded-lg">
                  <label class="block font-semibold text-gray-700 mb-2"
                    >Recommended Facility:</label
                  >
                  <input
                    type="text"
                    v-model="form.recommendedFacility"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 text-sm text-gray-800 mb-2"
                  />
                  <input
                    type="text"
                    v-model="form.facilityNote"
                    placeholder="Additional note"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 text-xs text-gray-600 italic"
                  />
                </div>
                <div class="bg-gray-50 p-5 rounded-lg">
                  <label class="block font-semibold text-gray-700 mb-2">Urgency Level:</label>
                  <select
                    v-model="form.urgencyLevel"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 text-sm text-gray-800 mb-2"
                  >
                    <option value="ROUTINE">ROUTINE</option>
                    <option value="URGENT">URGENT</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                  </select>
                  <input
                    type="text"
                    v-model="form.urgencyTimeframe"
                    placeholder="Timeframe"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 text-xs text-gray-600"
                  />
                </div>
              </div>

              <div class="bg-gray-50 p-5 rounded-lg">
                <label class="block font-semibold text-gray-700 mb-2"
                  >Required Medical Specialty:</label
                >
                <input
                  type="text"
                  v-model="form.requiredSpecialty"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 text-sm text-gray-800"
                />
              </div>

              <div class="bg-gray-50 p-5 rounded-lg">
                <label class="block font-semibold text-gray-700 mb-2"
                  >Recommended Transport Mode:</label
                >
                <input
                  type="text"
                  v-model="form.transportMode"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 text-sm text-gray-800 mb-2"
                />
                <input
                  type="text"
                  v-model="form.transportNote"
                  placeholder="Additional transport details"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2933FF]/50 text-xs text-gray-600"
                />
              </div>
            </div>
          </div>

          <!-- Important Instructions -->
          <div class="instructions mb-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
              TRANSFER INSTRUCTIONS
            </h3>
            <div class="bg-blue-50 border-l-4 border-blue-600 p-5 rounded">
              <ul class="space-y-3 text-sm text-gray-700">
                <li class="flex items-start gap-2">
                  <i class="fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0"></i>
                  <span
                    ><strong>Medical Records:</strong> Ensure all patient medical records, test
                    results, and imaging studies are included with the transfer documentation.</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <i class="fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0"></i>
                  <span
                    ><strong>Medication List:</strong> Provide complete list of current medications,
                    dosages, and administration schedule.</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <i class="fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0"></i>
                  <span
                    ><strong>Family Notification:</strong> Ensure patient's family or emergency
                    contact has been informed of the transfer and the receiving facility.</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <i class="fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0"></i>
                  <span
                    ><strong>Receiving Facility Coordination:</strong> Confirm bed availability and
                    acceptance by the receiving facility before initiating transfer.</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <i class="fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0"></i>
                  <span
                    ><strong>Patient Stability:</strong> Ensure patient is medically stable for
                    transport. Monitor vital signs during transfer.</span
                  >
                </li>
              </ul>
            </div>
          </div>

          <!-- Professional Statement -->
          <div class="statement mb-8 p-5 bg-blue-50 border-l-4 border-blue-600 rounded">
            <p class="text-sm text-gray-700 leading-relaxed">
              This transfer recommendation is issued based on the patient's current medical
              condition and the limitations of our facility's capabilities. The recommended transfer
              is in the best interest of the patient to ensure they receive appropriate and
              specialized medical care. This document serves as an official medical recommendation
              and should be presented to the receiving facility. All patient information is
              confidential and must be handled in accordance with applicable healthcare privacy
              regulations.
            </p>
          </div>

          <!-- ✅ FIXED: uses nurseDisplayName and nurseEmail -->
          <div class="approval mt-12 pt-8 border-t-2 border-gray-300">
            <div class="grid grid-cols-2 gap-8">
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2">Prepared By:</p>
                <p class="text-gray-800 font-medium mb-1">{{ printStore.nurseDisplayName }}</p>
                <p class="text-xs text-gray-600">{{ printStore.nurseEmail }}</p>
                <div class="mt-4 pt-2 border-t border-gray-400 w-48"></div>
                <p class="text-xs text-gray-600 mt-1">Nurse Signature</p>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2">Date Prepared:</p>
                <p class="text-gray-800">{{ printStore.todaysDate }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer text-center mt-12 pt-8 border-t border-gray-200 text-xs text-gray-500">
            <p class="mb-1">© 2024 ACLC Clinic. All rights reserved.</p>
            <p>
              This document is confidential and intended solely for authorized medical personnel.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Print Only Content (non-editable) -->
    <div class="print-only">
      <PrintContent />
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { usePrintStore } from '@/stores/printStore'
import { onMounted, onUnmounted, defineComponent, h, ref } from 'vue'

const router = useRouter()
const route = useRoute()
const printStore = usePrintStore()

const form = ref({
  transferReason:
    'The patient requires specialized care and advanced medical facilities beyond the current capacity of this clinic. Transfer to a hospital with appropriate departments and equipment is recommended for optimal patient care and recovery.',
  recommendedFacility: 'To Be Determined',
  facilityNote: 'Based on patient needs and availability',
  urgencyLevel: 'ROUTINE',
  urgencyTimeframe: 'within 24-48 hours',
  requiredSpecialty: 'General Medicine / As Required by Receiving Facility',
  transportMode: 'Medical Ambulance',
  transportNote: 'with basic life support equipment',
})

const PrintContent = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'p-12' }, [
        // Header
        h('div', { class: 'header text-center mb-12 pb-8 border-b-2 border-gray-300' }, [
          h('div', { class: 'flex items-center justify-center gap-4 mb-4' }, [
            h('div', {
              class: 'gradient-logo w-20 h-20',
              style: {
                mask: 'url(/images/ACLC.svg) center / contain no-repeat',
                WebkitMask: 'url(/images/ACLC.svg) center / contain no-repeat',
                background: 'linear-gradient(135deg, #2933ff, #ff5451)',
              },
            }),
          ]),
          h('h1', { class: 'text-4xl font-bold text-gray-800 mb-2' }, 'ACLC CLINIC'),
          h('p', { class: 'text-gray-600 text-sm' }, 'Healthcare Management System'),
          h('p', { class: 'text-gray-500 text-xs mt-2' }, 'Patient Transfer Recommendation'),
        ]),

        // Document Type Banner
        h('div', { class: 'mb-8 text-center' }, [
          h(
            'h2',
            { class: 'text-2xl font-bold text-gray-800 mb-2' },
            'PATIENT TRANSFER RECOMMENDATION',
          ),
          h('p', { class: 'text-gray-600' }, `Date Issued: ${printStore.todaysDate}`),
        ]),

        // Patient Information
        h('div', { class: 'patient-section mb-8 bg-gray-50 p-6 rounded-lg' }, [
          h(
            'h3',
            { class: 'text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300' },
            'PATIENT INFORMATION',
          ),
          h('div', { class: 'grid grid-cols-2 gap-4 text-sm' }, [
            h('div', [
              h('p', { class: 'text-gray-600 font-semibold mb-1' }, 'Full Name:'),
              h('p', { class: 'text-gray-800' }, printStore.patientFullName),
            ]),
            h('div', [
              h('p', { class: 'text-gray-600 font-semibold mb-1' }, 'Patient ID:'),
              h('p', { class: 'text-gray-800' }, `#${printStore.patient?.id || 'N/A'}`),
            ]),
            h('div', [
              h('p', { class: 'text-gray-600 font-semibold mb-1' }, 'Contact Number:'),
              h('p', { class: 'text-gray-800' }, printStore.patient?.emergencyContact || 'N/A'),
            ]),
            h('div', [
              h('p', { class: 'text-gray-600 font-semibold mb-1' }, 'Email Address:'),
              h('p', { class: 'text-gray-800' }, printStore.patient?.email || 'N/A'),
            ]),
            h('div', { class: 'col-span-2' }, [
              h('p', { class: 'text-gray-600 font-semibold mb-1' }, 'Address:'),
              h('p', { class: 'text-gray-800' }, printStore.patient?.address || 'Not Provided'),
            ]),
          ]),
        ]),

        // Medical Summary
        h('div', { class: 'medical-summary mb-8' }, [
          h(
            'h3',
            { class: 'text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300' },
            'MEDICAL SUMMARY',
          ),
          printStore.records.length > 0
            ? h('div', { class: 'bg-gray-50 p-6 rounded-lg' }, [
                h('div', { class: 'space-y-4' }, [
                  h('div', [
                    h('p', { class: 'font-semibold text-gray-700 mb-1' }, 'Recent Diagnosis:'),
                    h(
                      'p',
                      { class: 'text-gray-800' },
                      printStore.records[0]?.diagnosis || 'Not Specified',
                    ),
                  ]),
                  h('div', [
                    h('p', { class: 'font-semibold text-gray-700 mb-1' }, 'Symptoms:'),
                    h(
                      'p',
                      { class: 'text-gray-800' },
                      printStore.records[0]?.symptom || 'Not Specified',
                    ),
                  ]),
                  h('div', [
                    h('p', { class: 'font-semibold text-gray-700 mb-1' }, 'Current Treatment:'),
                    h(
                      'p',
                      { class: 'text-gray-800' },
                      printStore.records[0]?.treatment || 'Not Specified',
                    ),
                  ]),
                  // Latest follow-up summary
                  printStore.latestFollowup
                    ? h('div', { class: 'pt-4 border-t border-gray-200' }, [
                        h(
                          'p',
                          {
                            class:
                              'text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-1',
                          },
                          [
                            h('i', { class: 'fa-solid fa-rotate-right' }),
                            ` Latest Follow-up — ${formatDate(printStore.latestFollowup.date)}`,
                          ],
                        ),
                        h('div', { class: 'grid grid-cols-2 gap-3 text-sm' }, [
                          printStore.latestFollowup.new_symptom
                            ? h('div', [
                                h(
                                  'p',
                                  { class: 'font-semibold text-orange-600 mb-0.5' },
                                  'Updated Symptom:',
                                ),
                                h(
                                  'p',
                                  { class: 'text-gray-800' },
                                  printStore.latestFollowup.new_symptom,
                                ),
                              ])
                            : null,
                          printStore.latestFollowup.new_diagnostic
                            ? h('div', [
                                h(
                                  'p',
                                  { class: 'font-semibold text-orange-600 mb-0.5' },
                                  'Updated Diagnosis:',
                                ),
                                h(
                                  'p',
                                  { class: 'text-gray-800' },
                                  printStore.latestFollowup.new_diagnostic,
                                ),
                              ])
                            : null,
                          printStore.latestFollowup.additional_treatment
                            ? h('div', { class: 'col-span-2' }, [
                                h(
                                  'p',
                                  { class: 'font-semibold text-emerald-700 mb-0.5' },
                                  'Additional Treatment:',
                                ),
                                h(
                                  'p',
                                  { class: 'text-gray-800' },
                                  printStore.latestFollowup.additional_treatment,
                                ),
                              ])
                            : null,
                          printStore.latestFollowup.notes
                            ? h('div', { class: 'col-span-2' }, [
                                h('p', { class: 'font-semibold text-gray-500 mb-0.5' }, 'Notes:'),
                                h(
                                  'p',
                                  { class: 'text-gray-600 italic' },
                                  printStore.latestFollowup.notes,
                                ),
                              ])
                            : null,
                        ]),
                      ])
                    : null,
                ]),
              ])
            : h('div', { class: 'bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded' }, [
                h('p', { class: 'text-yellow-800 text-sm flex items-center gap-2' }, [
                  h('i', { class: 'fa-solid fa-exclamation-triangle' }),
                  'No recent medical records available. Please update patient records before transfer.',
                ]),
              ]),
        ]),

        // Transfer Recommendation Details
        h('div', { class: 'transfer-details mb-8' }, [
          h(
            'h3',
            { class: 'text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300' },
            'TRANSFER RECOMMENDATION',
          ),
          h('div', { class: 'space-y-4' }, [
            h('div', { class: 'bg-gray-50 p-5 rounded-lg' }, [
              h('p', { class: 'font-semibold text-gray-700 mb-2' }, 'Reason for Transfer:'),
              h('p', { class: 'text-gray-800 text-sm leading-relaxed' }, form.value.transferReason),
            ]),
            h('div', { class: 'grid grid-cols-2 gap-4' }, [
              h('div', { class: 'bg-gray-50 p-5 rounded-lg' }, [
                h('p', { class: 'font-semibold text-gray-700 mb-2' }, 'Recommended Facility:'),
                h('p', { class: 'text-gray-800' }, form.value.recommendedFacility),
                h('p', { class: 'text-gray-500 text-xs mt-1 italic' }, form.value.facilityNote),
              ]),
              h('div', { class: 'bg-gray-50 p-5 rounded-lg' }, [
                h('p', { class: 'font-semibold text-gray-700 mb-2' }, 'Urgency Level:'),
                h(
                  'span',
                  {
                    class: `inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      form.value.urgencyLevel === 'EMERGENCY'
                        ? 'bg-red-100 text-red-800'
                        : form.value.urgencyLevel === 'URGENT'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`,
                  },
                  form.value.urgencyLevel,
                ),
                h('p', { class: 'text-gray-500 text-xs mt-2' }, `(${form.value.urgencyTimeframe})`),
              ]),
            ]),
            h('div', { class: 'bg-gray-50 p-5 rounded-lg' }, [
              h('p', { class: 'font-semibold text-gray-700 mb-2' }, 'Required Medical Specialty:'),
              h('p', { class: 'text-gray-800' }, form.value.requiredSpecialty),
            ]),
            h('div', { class: 'bg-gray-50 p-5 rounded-lg' }, [
              h('p', { class: 'font-semibold text-gray-700 mb-2' }, 'Recommended Transport Mode:'),
              h('div', { class: 'flex items-center gap-2' }, [
                h('i', { class: 'fa-solid fa-ambulance text-blue-600 text-lg' }),
                h('p', { class: 'text-gray-800' }, form.value.transportMode),
                h('span', { class: 'text-gray-500 text-xs' }, `(${form.value.transportNote})`),
              ]),
            ]),
          ]),
        ]),

        // Transfer Instructions
        h('div', { class: 'instructions mb-8' }, [
          h(
            'h3',
            { class: 'text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300' },
            'TRANSFER INSTRUCTIONS',
          ),
          h('div', { class: 'bg-blue-50 border-l-4 border-blue-600 p-5 rounded' }, [
            h('ul', { class: 'space-y-3 text-sm text-gray-700' }, [
              h('li', { class: 'flex items-start gap-2' }, [
                h('i', { class: 'fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0' }),
                h('span', [
                  h('strong', 'Medical Records: '),
                  'Ensure all patient medical records, test results, and imaging studies are included with the transfer documentation.',
                ]),
              ]),
              h('li', { class: 'flex items-start gap-2' }, [
                h('i', { class: 'fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0' }),
                h('span', [
                  h('strong', 'Medication List: '),
                  'Provide complete list of current medications, dosages, and administration schedule.',
                ]),
              ]),
              h('li', { class: 'flex items-start gap-2' }, [
                h('i', { class: 'fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0' }),
                h('span', [
                  h('strong', 'Family Notification: '),
                  "Ensure patient's family or emergency contact has been informed of the transfer and the receiving facility.",
                ]),
              ]),
              h('li', { class: 'flex items-start gap-2' }, [
                h('i', { class: 'fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0' }),
                h('span', [
                  h('strong', 'Receiving Facility Coordination: '),
                  'Confirm bed availability and acceptance by the receiving facility before initiating transfer.',
                ]),
              ]),
              h('li', { class: 'flex items-start gap-2' }, [
                h('i', { class: 'fa-solid fa-circle-check text-blue-600 mt-0.5 flex-shrink-0' }),
                h('span', [
                  h('strong', 'Patient Stability: '),
                  'Ensure patient is medically stable for transport. Monitor vital signs during transfer.',
                ]),
              ]),
            ]),
          ]),
        ]),

        // Professional Statement
        h('div', { class: 'statement mb-8 p-5 bg-blue-50 border-l-4 border-blue-600 rounded' }, [
          h('p', { class: 'text-sm text-gray-700 leading-relaxed' }, [
            "This transfer recommendation is issued based on the patient's current medical condition and the limitations of our facility's capabilities. ",
            'The recommended transfer is in the best interest of the patient to ensure they receive appropriate and specialized medical care. ',
            'This document serves as an official medical recommendation and should be presented to the receiving facility. ',
            'All patient information is confidential and must be handled in accordance with applicable healthcare privacy regulations.',
          ]),
        ]),

        // ✅ FIXED: uses nurseDisplayName and nurseEmail
        h('div', { class: 'approval mt-12 pt-8 border-t-2 border-gray-300' }, [
          h('div', { class: 'grid grid-cols-2 gap-8' }, [
            h('div', [
              h('p', { class: 'text-sm font-semibold text-gray-700 mb-2' }, 'Prepared By:'),
              h('p', { class: 'text-gray-800 font-medium mb-1' }, printStore.nurseDisplayName),
              h('p', { class: 'text-xs text-gray-600' }, printStore.nurseEmail),
              h('div', { class: 'mt-4 pt-2 border-t border-gray-400 w-48' }),
              h('p', { class: 'text-xs text-gray-600 mt-1' }, 'Nurse Signature'),
            ]),
            h('div', [
              h('p', { class: 'text-sm font-semibold text-gray-700 mb-2' }, 'Date Prepared:'),
              h('p', { class: 'text-gray-800' }, printStore.todaysDate),
            ]),
          ]),
        ]),

        // Footer
        h(
          'div',
          { class: 'footer text-center mt-12 pt-8 border-t border-gray-200 text-xs text-gray-500' },
          [
            h('p', { class: 'mb-1' }, '© 2024 ACLC Clinic. All rights reserved.'),
            h(
              'p',
              'This document is confidential and intended solely for authorized medical personnel.',
            ),
          ],
        ),
      ])
  },
})

onMounted(() => {
  const patientId = Number(route.params.patientId)
  const recordId = route.params.recordId ? Number(route.params.recordId) : null
  printStore.setPrintData(patientId, recordId)
})

onUnmounted(() => {
  printStore.resetPrintData()
})

const goBack = () => router.back()
const print = () => printStore.printDocument()

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.gradient-logo {
  mask: url('/images/ACLC.svg') center / contain no-repeat;
  -webkit-mask: url('/images/ACLC.svg') center / contain no-repeat;
  background: linear-gradient(135deg, #2933ff, #ff5451);
  display: inline-block;
}

.screen-only {
  display: block;
}

.print-only {
  display: none;
}

@media print {
  .screen-only {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .recommendation-container {
    background: white !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .medical-summary,
  .transfer-details,
  .instructions {
    page-break-inside: avoid;
  }

  .approval {
    page-break-before: avoid;
  }

  @page {
    margin: 1.5cm;
  }
}

.recommendation-content {
  background: white;
  min-height: 100vh;
}
</style>
