<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
    <div
      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      @click="emit('close')"
    />

    <div
      class="relative bg-white w-full max-w-md max-h-[80vh] rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-300"
    >
      <div
        class="flex justify-between items-center px-4 md:px-6 py-4 border-b border-slate-200 shrink-0"
      >
        <div>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">{{ formattedDate }}</h2>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            {{ eventCount }} Events
          </p>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <div class="px-4 md:px-6 py-4 flex-1 overflow-y-auto custom-scrollbar">
        <div
          v-if="sortedEvents.length === 0"
          class="flex flex-col items-center justify-center py-12 text-slate-300"
        >
          <i class="fa-solid fa-calendar-day text-5xl mb-4 opacity-20"></i>
          <p class="font-bold text-sm">No events</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <button
            v-for="event in sortedEvents"
            :key="event.id"
            @click="emit('select', event.id)"
            class="w-full text-left p-4 rounded-lg border transition-all duration-300 relative group overflow-hidden"
            :class="[
              'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50 text-slate-800',
            ]"
          >
            <div
              class="absolute left-0 top-0 bottom-0 w-1"
              :style="{
                backgroundColor: event.color || '#2563eb',
                opacity: 0.7,
              }"
            />

            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold truncate text-sm text-slate-900">
                {{ event.summary || '(Untitled Event)' }}
              </h3>
            </div>
            <div
              class="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              <span class="flex items-center">
                <i class="fa-regular fa-clock mr-1.5 opacity-70"></i>
                {{ formattedTime(event.start) }}
              </span>
              <span class="flex items-center">
                <i class="fa-regular fa-calendar mr-1.5 opacity-70"></i>
                {{ formattedDateShort(event.start) }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <div
        class="bg-slate-50/50 px-4 md:px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200 shrink-0"
      >
        <button
          @click="emit('addEvent')"
          class="flex-1 px-4 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <i class="fa-solid fa-plus"></i>
          <span>Add Event</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IcsEvent } from '../types'
import { formatTimeUTC8, formatDateUTC8 } from '../utils/timezoneHelper'

const props = defineProps<{
  date: Date
  events: IcsEvent[]
}>()

const emit = defineEmits<{
  close: []
  select: [id: string]
  addEvent: []
}>()

const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
})

const eventCount = computed(() => sortedEvents.value.length)

const formattedDate = computed(() => {
  return props.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const formattedTime = (dateStr: string) => {
  return formatTimeUTC8(dateStr)
}

const formattedDateShort = (dateStr: string) => {
  return formatDateUTC8(dateStr)
}
</script>
