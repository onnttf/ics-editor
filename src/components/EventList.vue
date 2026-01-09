<template>
  <div class="absolute inset-0 overflow-y-auto pr-2 pb-12 custom-scrollbar">
    <div
      v-if="sortedEvents.length === 0"
      class="flex flex-col items-center justify-center h-full py-12 text-slate-300"
    >
      <i class="fa-solid fa-calendar-day text-5xl mb-4 opacity-20"></i>
      <p class="font-bold text-sm">No events</p>
    </div>

    <div v-else class="flex flex-col gap-3">
      <button
        v-for="event in sortedEvents"
        :key="event.id"
        @click="$emit('select', event.id)"
        @mouseenter="handleMouseEnter($event, event)"
        @mouseleave="hoveredEvent = null"
        class="w-full text-left p-4 rounded-lg border transition-all duration-300 relative group overflow-hidden"
        :class="[
          isSelected(event.id)
            ? 'text-white shadow-md -translate-y-0.5'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50 text-slate-800',
        ]"
        :style="{
          backgroundColor: isSelected(event.id) ? eventColor : undefined,
          borderColor: isSelected(event.id)
            ? eventColor
            : hoveredEvent?.event.id === event.id
              ? `${eventColor}44`
              : undefined,
        }"
      >
        <div
          class="absolute left-0 top-0 bottom-0 w-1"
          :style="{
            backgroundColor: event.color || '#2563eb',
            opacity: isSelected(event.id) ? 0.8 : 0.7,
          }"
        />

        <div class="flex justify-between items-start mb-2">
          <h3
            class="font-bold truncate text-sm transition-colors"
            :class="[isSelected(event.id) ? 'text-white' : 'text-slate-900']"
            :style="
              !isSelected(event.id) && hoveredEvent?.event.id === event.id
                ? { color: eventColor }
                : undefined
            "
          >
            {{ event.summary || '(Untitled Event)' }}
          </h3>
        </div>
        <div
          :class="[
            'flex items-center gap-3 text-xs font-bold uppercase tracking-wider',
            isSelected(event.id) ? 'text-white/80' : 'text-slate-400',
          ]"
        >
          <span class="flex items-center">
            <i class="fa-regular fa-clock mr-1.5 opacity-70"></i>
            {{ formattedTime(event.start) }}
          </span>
          <span class="flex items-center">
            <i class="fa-regular fa-calendar mr-1.5 opacity-70"></i>
            {{ formattedDate(event.start) }}
          </span>
        </div>
      </button>
    </div>

    <Tooltip v-if="hoveredEvent" :event="hoveredEvent.event" :position="hoveredEvent.position" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IcsEvent } from '../types'
import Tooltip from './EventTooltip.vue'
import { formatTimeUTC8, formatDateUTC8 } from '../utils/timezoneHelper'

const props = defineProps<{
  events: IcsEvent[]
  selectedId: string | null
}>()

const hoveredEvent = ref<{ event: IcsEvent; position: { x: number; y: number } } | null>(null)

const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
})

const isSelected = (id: string) => props.selectedId === id

const getEventColor = (event: IcsEvent) => event.color || '#2563eb'

const eventColor = computed(() => {
  const selectedEvent = props.events.find((e) => e.id === props.selectedId)
  return selectedEvent ? getEventColor(selectedEvent) : '#2563eb'
})

const formattedTime = (dateStr: string) => {
  return formatTimeUTC8(dateStr)
}

const formattedDate = (dateStr: string) => {
  return formatDateUTC8(dateStr)
}

const handleMouseEnter = (e: MouseEvent, event: IcsEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  hoveredEvent.value = {
    event,
    position: {
      x: rect.left + rect.width / 2,
      y: rect.top,
    },
  }
}
</script>
