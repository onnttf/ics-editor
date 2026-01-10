<template>
  <div class="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-6">
    <div
      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      @click="handleCancel"
    />

    <div
      class="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-300"
    >
      <div
        v-if="isConfirmingDelete"
        class="absolute inset-0 z-60 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6 text-center animate-in fade-in duration-200"
      >
        <div
          class="w-14 h-14 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-3 md:mb-4 shadow-inner"
        >
          <i class="fa-solid fa-triangle-exclamation text-xl md:text-2xl"></i>
        </div>
        <h3 class="text-lg md:text-xl font-black text-slate-900 mb-2">Delete Event?</h3>
        <p class="text-slate-500 text-xs md:text-sm mb-4 md:mb-6 max-w-xs leading-relaxed">
          Are you sure you want to delete this event?
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-3">
          <button
            @click="isConfirmingDelete = false"
            class="w-full sm:w-auto px-6 py-2.5 md:px-8 md:py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            Keep Event
          </button>
          <button
            @click="emit('delete', event.id)"
            class="w-full sm:w-auto px-6 py-2.5 md:px-8 md:py-3 bg-red-500 text-white rounded-lg font-black text-sm hover:bg-red-600 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Yes, Delete
          </button>
        </div>
      </div>

      <div
        v-if="isConfirmingCancel"
        class="absolute inset-0 z-60 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6 text-center animate-in fade-in duration-200"
      >
        <div
          class="w-14 h-14 md:w-16 md:h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-3 md:mb-4 shadow-inner"
        >
          <i class="fa-solid fa-triangle-exclamation text-xl md:text-2xl"></i>
        </div>
        <h3 class="text-lg md:text-xl font-black text-slate-900 mb-2">Unsaved Changes</h3>
        <p class="text-slate-500 text-xs md:text-sm mb-4 md:mb-6 max-w-xs leading-relaxed">
          You have unsaved changes. Are you sure you want to close?
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-3">
          <button
            @click="handleConfirmCancel"
            class="w-full sm:w-auto px-6 py-2.5 md:px-8 md:py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            Discard Changes
          </button>
          <button
            @click="isConfirmingCancel = false"
            class="w-full sm:w-auto px-6 py-2.5 md:px-8 md:py-3 bg-blue-600 text-white rounded-lg font-black text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Keep Editing
          </button>
        </div>
      </div>

      <div
        class="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 border-b border-slate-200 shrink-0"
      >
        <div class="flex items-center gap-4 md:gap-6">
          <div
            class="w-9 h-9 md:w-11 md:h-11 rounded-lg flex items-center justify-center text-white shadow-inner transition-colors duration-300"
            :style="{ backgroundColor: formData.color }"
          >
            <i
              :class="`fa-solid ${isNew ? 'fa-calendar-plus' : 'fa-pen-to-square'} text-lg md:text-xl`"
            ></i>
          </div>
          <div>
            <h2 class="text-base md:text-xl font-black text-slate-900 tracking-tight">
              {{ isNew ? 'Add Event' : 'Edit Event' }}
            </h2>
            <p
              class="hidden xs:block text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5"
            >
              {{ isNew ? 'Creating new event' : 'Editing event' }}
            </p>
          </div>
        </div>
        <button
          v-if="!isNew"
          @click="isConfirmingDelete = true"
          class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-sm"
          title="Delete Event"
        >
          <i class="fa-solid fa-trash-can text-sm"></i>
        </button>
      </div>

      <div class="px-4 md:px-6 py-4 md:py-6 flex-1 overflow-y-auto custom-scrollbar">
        <div class="flex flex-col gap-4 md:gap-6">
          <div class="group">
            <label
              class="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 md:mb-3 group-focus-within:text-blue-600 transition-colors"
              >Title</label
            >
            <input
              v-model="formData.summary"
              type="text"
              name="summary"
              placeholder="E.g. Quarterly Review"
              class="w-full px-0 py-1 md:py-1.5 bg-transparent border-b-2 border-slate-100 focus:border-blue-500 outline-none transition-all text-lg md:text-2xl font-black text-slate-800"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6">
            <div class="group">
              <label
                class="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 md:mb-4 transition-colors"
                >Color</label
              >
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in presetColors"
                  :key="color.value"
                  @click="handleColorSelect(color.value)"
                  class="w-8 h-8 md:w-10 md:h-10 rounded-full border-4 transition-all"
                  :class="[
                    formData.color === color.value
                      ? 'border-white ring-2 ring-blue-500 scale-110 shadow-md'
                      : 'border-transparent scale-100',
                  ]"
                  :style="{ backgroundColor: color.value }"
                  :title="color.name"
                />
              </div>
            </div>

            <div class="hidden md:block"></div>

            <div class="group">
              <label
                class="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 md:mb-4 group-focus-within:text-blue-600 transition-colors"
                >Start Time</label
              >
              <input
                v-model="startDateTime"
                type="datetime-local"
                :class="[
                  'w-full px-3 py-2.5 rounded-lg focus:bg-white focus:ring-4 outline-none transition-all font-bold text-sm',
                  validationErrors.start
                    ? 'bg-red-50 border-2 border-red-300 focus:ring-red-50 text-red-700'
                    : 'bg-slate-50 border border-slate-100 focus:ring-blue-50 text-slate-700',
                ]"
              />
              <p v-if="validationErrors.start" class="text-xs font-bold text-red-500 mt-1">
                {{ validationErrors.start }}
              </p>
            </div>

            <div class="group">
              <label
                class="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 md:mb-4 group-focus-within:text-blue-600 transition-colors"
                >End Time</label
              >
              <input
                v-model="endDateTime"
                type="datetime-local"
                :class="[
                  'w-full px-3 py-2.5 rounded-lg focus:bg-white focus:ring-4 outline-none transition-all font-bold text-sm',
                  validationErrors.end
                    ? 'bg-red-50 border-2 border-red-300 focus:ring-red-50 text-red-700'
                    : 'bg-slate-50 border border-slate-100 focus:ring-blue-50 text-slate-700',
                ]"
              />
              <p v-if="validationErrors.end" class="text-xs font-bold text-red-500 mt-1">
                {{ validationErrors.end }}
              </p>
            </div>

            <div class="md:col-span-2 group">
              <label
                class="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 md:mb-4 group-focus-within:text-blue-600 transition-colors"
                >Location</label
              >
              <div class="relative">
                <i
                  class="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                ></i>
                <input
                  v-model="formData.location"
                  type="text"
                  name="location"
                  placeholder="Physical address or meeting link"
                  class="w-full pl-11 pr-5 py-2.5 md:py-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700 text-sm"
                />
              </div>
            </div>

            <div class="md:col-span-2 group">
              <div class="flex justify-between items-center mb-4">
                <label
                  class="block text-xs font-black text-slate-400 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors"
                  >Description</label
                >
                <button
                  @click="handleImproveDescription"
                  :disabled="isImproving"
                  class="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-white hover:bg-blue-600 flex items-center gap-2 bg-blue-50 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <i
                    :class="`fa-solid fa-wand-magic-sparkles ${isImproving ? 'animate-spin' : ''}`"
                  ></i>
                  <span class="hidden sm:inline">{{
                    isImproving ? 'Reasoning...' : 'AI Refine'
                  }}</span>
                  <span class="sm:hidden">{{ isImproving ? '...' : 'Refine' }}</span>
                </button>
              </div>
              <textarea
                v-model="formData.description"
                name="description"
                rows="3"
                placeholder="Add agenda, meeting links, or notes..."
                class="w-full px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-700 font-medium resize-none leading-relaxed shadow-inner text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-slate-50/50 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between border-t border-slate-200 shrink-0"
      >
        <div
          class="hidden sm:flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-wider"
        ></div>
        <div class="flex-1 sm:flex-none flex items-center justify-end gap-3 md:gap-4">
          <button
            @click="handleCancel"
            class="px-3 md:px-6 py-2 md:py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="handleConfirm"
            class="flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            {{ isNew ? 'Create' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { IcsEvent } from '../types'
import { suggestOptimizedDescription } from '../services/geminiService'
import { toDateTimeLocalUTC8 } from '../utils/timezoneHelper'

const PRESET_COLORS = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
]

const props = defineProps<{
  event: IcsEvent
  isNew?: boolean
}>()

const emit = defineEmits<{
  confirm: [event: IcsEvent]
  cancel: []
  delete: [id: string]
}>()

const defaultColor = PRESET_COLORS[0]?.value || '#2563eb'
const formData = ref<IcsEvent>({ ...props.event, color: props.event.color || defaultColor })
const isImproving = ref(false)
const isConfirmingDelete = ref(false)
const isConfirmingCancel = ref(false)
const presetColors = PRESET_COLORS
const validationErrors = ref<Record<string, string>>({})
const originalEvent = ref<IcsEvent>({ ...props.event, color: props.event.color || defaultColor })

watch(
  () => props.event,
  (newEvent) => {
    formData.value = { ...newEvent, color: newEvent.color || defaultColor }
    originalEvent.value = { ...newEvent, color: newEvent.color || defaultColor }
    isConfirmingDelete.value = false
    isConfirmingCancel.value = false
  },
)

const startDateTime = computed({
  get: () => toDateTimeLocalUTC8(formData.value.start),
  set: (val) => {
    if (!val) return
    formData.value.start = new Date(val).toISOString()
  },
})

const endDateTime = computed({
  get: () => toDateTimeLocalUTC8(formData.value.end),
  set: (val) => {
    if (!val) return
    formData.value.end = new Date(val).toISOString()
  },
})

const hasUnsavedChanges = computed(() => {
  return (
    formData.value.summary !== originalEvent.value.summary ||
    formData.value.start !== originalEvent.value.start ||
    formData.value.end !== originalEvent.value.end ||
    formData.value.location !== originalEvent.value.location ||
    formData.value.description !== originalEvent.value.description ||
    formData.value.color !== originalEvent.value.color
  )
})

const handleColorSelect = (color: string) => {
  formData.value.color = color
}

const handleImproveDescription = async () => {
  isImproving.value = true
  try {
    const improved = await suggestOptimizedDescription(formData.value)
    formData.value.description = improved
  } catch (err) {
    console.error(err)
  } finally {
    isImproving.value = false
  }
}

const validateForm = (): boolean => {
  const errors: Record<string, string> = {}

  if (!startDateTime.value) {
    errors.start = 'Start time is required'
  }

  if (!endDateTime.value) {
    errors.end = 'End time is required'
  } else if (startDateTime.value && endDateTime.value) {
    const startDate = new Date(startDateTime.value)
    const endDate = new Date(endDateTime.value)
    if (endDate <= startDate) {
      errors.end = 'End time must be after start time'
    }
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleConfirm = () => {
  if (validateForm()) {
    originalEvent.value = { ...formData.value }
    emit('confirm', formData.value)
  }
}

const handleCancel = () => {
  if (hasUnsavedChanges.value) {
    isConfirmingCancel.value = true
  } else {
    emit('cancel')
  }
}

const handleConfirmCancel = () => {
  isConfirmingCancel.value = false
  emit('cancel')
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleCancel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
