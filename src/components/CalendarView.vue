<template>
  <div class="flex flex-col h-full bg-white relative">
    <div
      class="px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0"
    >
      <div class="flex items-center gap-2 md:gap-4">
        <h2 class="text-lg md:text-xl font-black text-slate-900 tracking-tight">
          {{ currentDate.toLocaleString('default', { month: 'long' }) }}
          <span class="text-blue-600 md:inline">{{ year }}</span>
        </h2>
      </div>

      <div class="flex items-center gap-2 md:gap-3">
        <button
          @click="handlePrev"
          class="px-3 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all cursor-pointer border border-transparent active:scale-95"
        >
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
        <button
          @click="handleToday"
          class="px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all cursor-pointer border border-transparent active:scale-95"
        >
          Today
        </button>
        <button
          @click="handleNext"
          class="px-3 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all cursor-pointer border border-transparent active:scale-95"
        >
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50/30 shrink-0">
      <div
        v-for="day in weekDays"
        :key="day"
        class="py-2 md:py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400"
      >
        {{ day }}
      </div>
    </div>

    <div
      ref="scrollContainerRef"
      class="flex-1 bg-white custom-scrollbar overflow-hidden flex flex-col"
    >
      <div
        class="flex-1 grid grid-cols-7 auto-rows-fr border-l border-t border-slate-200 bg-slate-50/5 min-h-0"
      >
        <div
          v-for="(date, idx) in days"
          :key="idx"
          @click="date && handleDateClick(date)"
          class="flex flex-col p-2 md:p-3 border-r border-b border-slate-100 transition-all group/cell min-h-0"
          :class="[
            !date
              ? 'bg-slate-100'
              : 'bg-white hover:bg-blue-50/30 cursor-pointer active:bg-blue-100/40',
          ]"
        >
          <div v-if="date" class="flex flex-col h-full min-h-0 pointer-events-none">
            <div class="flex justify-between items-start mb-2 shrink-0 pointer-events-auto">
              <div
                class="opacity-0 group-hover/cell:opacity-100 transition-opacity hidden md:block"
              >
                <i class="fa-solid fa-plus text-xs text-blue-600 ml-1"></i>
              </div>
              <span
                @click="emit('clickDate', date)"
                class="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-sm font-black cursor-pointer transition-colors"
                :class="[
                  isToday(date)
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : isCurrentMonth(date)
                      ? 'text-slate-500 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-100',
                ]"
              >
                {{ date.getDate() }}
              </span>
            </div>
            <div
              class="flex flex-col gap-1 md:gap-1.5 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar min-h-0 pointer-events-auto pr-2"
            >
              <button
                v-for="ev in getVisibleEvents(date)"
                :key="ev.id"
                @mouseenter="(e) => handleEventHover(e, ev)"
                @mouseleave="hoveredEvent = null"
                class="w-full text-left rounded border transition-all truncate text-xs font-bold active:scale-[0.98] flex items-center shrink-0 py-1 px-1.5 md:px-2"
                :class="{ 'opacity-40': !isCurrentMonth(date) }"
                :style="{
                  backgroundColor: `${ev.color || '#2563eb'}15`,
                  borderColor: `${ev.color || '#2563eb'}40`,
                  color: ev.color || '#2563eb',
                }"
              >
                <span class="flex-1 truncate">{{ ev.summary || '(No Title)' }}</span>
              </button>
              <button
                v-if="getOverflowCount(date) > 0"
                @click="
                  (e) => {
                    e.stopPropagation()
                    emit('clickDate', date)
                  }
                "
                class="w-full text-left px-1.5 md:px-2 py-1 rounded border transition-all text-xs font-bold shrink-0"
                :class="{ 'opacity-40': !isCurrentMonth(date) }"
                :style="{
                  backgroundColor: '#f1f5f9',
                  borderColor: '#cbd5e1',
                  color: '#64748b',
                }"
              >
                +{{ getOverflowCount(date) }} more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Tooltip v-if="hoveredEvent" :event="hoveredEvent.event" :position="hoveredEvent.position" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IcsEvent } from '../types'
import Tooltip from './EventTooltip.vue'
import { getDateUTC8 } from '../utils/timezoneHelper'

const props = defineProps<{
  events: IcsEvent[]
}>()

const emit = defineEmits<{
  selectEvent: [id: string]
  addEvent: [date: Date]
  clickDate: [date: Date]
}>()

const currentDate = ref(getDateUTC8())
const hoveredEvent = ref<{ event: IcsEvent; position: { x: number; y: number } } | null>(null)

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const days = computed(() => {
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const firstDay = new Date(year.value, month.value, 1).getDay()
  const days: (Date | null)[] = []

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year.value, month.value, i))
  }

  const totalCellsNeeded = Math.ceil(days.length / 7) * 7
  while (days.length < totalCellsNeeded) {
    days.push(null)
  }

  return days
})

const handlePrev = () => {
  currentDate.value = new Date(year.value, month.value - 1, 1)
}

const handleNext = () => {
  currentDate.value = new Date(year.value, month.value + 1, 1)
}

const handleToday = () => {
  currentDate.value = getDateUTC8()
}

const navigateToDate = (date: Date) => {
  currentDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
}

defineExpose({
  navigateToDate,
})

const handleEventHover = (e: MouseEvent, event: IcsEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  hoveredEvent.value = {
    event,
    position: {
      x: rect.left + rect.width / 2,
      y: rect.top,
    },
  }
}

const handleDateClick = (date: Date) => {
  const dayEvents = getEventsForDay(date)
  if (dayEvents.length > 0) {
    emit('clickDate', date)
  } else {
    emit('addEvent', date)
  }
}

const isToday = (date: Date) => {
  const today = getDateUTC8()
  return date.toDateString() === today.toDateString()
}

const isCurrentMonth = (date: Date) => {
  return date.getMonth() === month.value && date.getFullYear() === year.value
}

const getEventsForDay = (date: Date) => {
  return props.events
    .filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      const eventStartDay = new Date(
        eventStart.getFullYear(),
        eventStart.getMonth(),
        eventStart.getDate(),
      )

      const dayStartsEvent = dayStart.getTime() === eventStartDay.getTime()

      return dayStart < eventEnd && dayEnd > eventStart && dayStartsEvent
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

const maxVisibleEvents = computed(() => {
  if (typeof window === 'undefined') return 3
  return window.innerWidth < 768 ? 2 : 3
})

const getVisibleEvents = (date: Date) => {
  const events = getEventsForDay(date)
  return events.slice(0, maxVisibleEvents.value)
}

const getOverflowCount = (date: Date) => {
  const events = getEventsForDay(date)
  return Math.max(0, events.length - maxVisibleEvents.value)
}
</script>
