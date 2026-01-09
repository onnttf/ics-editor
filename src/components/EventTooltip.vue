<template>
  <Teleport to="body">
    <div
      ref="tooltipRef"
      class="fixed z-9999 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
      :style="tooltipStyle"
    >
      <div
        class="bg-white/95 backdrop-blur-xl p-4 rounded-lg shadow-xl border border-slate-200 min-w-60 max-w-72"
      >
        <div class="flex flex-col gap-3">
          <div class="flex items-start gap-3">
            <div class="w-5 h-5 flex items-center justify-center shrink-0">
              <div
                class="w-2 h-2 rounded-full shadow-md"
                :style="{ backgroundColor: eventColor, boxShadow: `0 0 8px ${eventColor}66` }"
              ></div>
            </div>
            <p class="text-sm font-black text-slate-900 leading-5 tracking-tight">
              {{ event.summary || '(Untitled Event)' }}
            </p>
          </div>

          <div class="text-xs font-bold uppercase tracking-wider text-slate-500">
            <div class="flex items-start gap-3">
              <div class="w-5 h-4 flex items-center justify-center shrink-0">
                <i class="fa-regular fa-calendar-check opacity-70 text-slate-400"></i>
              </div>
              <span class="leading-4">{{ formattedStart }}</span>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-5 h-4 flex items-center justify-center shrink-0"></div>
              <span class="leading-4">{{ formattedEnd }}</span>
            </div>
          </div>

          <div
            v-if="event.location || event.description"
            class="flex flex-col gap-3 pt-3 border-t border-slate-200"
          >
            <div
              v-if="event.location"
              class="flex items-start gap-3 text-xs font-medium text-slate-500"
            >
              <div class="w-5 h-4 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-location-dot text-slate-400"></i>
              </div>
              <span class="leading-4 flex-1">{{ event.location }}</span>
            </div>

            <div
              v-if="event.description"
              class="flex items-start gap-3 text-xs text-slate-400 italic"
            >
              <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-align-left text-slate-300"></i>
              </div>
              <span class="leading-5 flex-1">{{ truncatedDescription }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { IcsEvent } from '../types'
import { computed, ref, onMounted, nextTick } from 'vue'
import { formatDateTimeUTC8 } from '../utils/timezoneHelper'

const props = defineProps<{
  event: IcsEvent
  position: { x: number; y: number }
}>()

const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})

const eventColor = computed(() => props.event.color || '#2563eb')

const formattedStart = computed(() => {
  return formatDateTimeUTC8(props.event.start)
})

const formattedEnd = computed(() => {
  return formatDateTimeUTC8(props.event.end)
})

const truncatedDescription = computed(() => {
  if (props.event.description && props.event.description.length > 120) {
    return props.event.description.substring(0, 120) + '...'
  }
  return props.event.description
})

const PADDING = 12

const updatePosition = () => {
  if (!tooltipRef.value) return

  const rect = tooltipRef.value.getBoundingClientRect()
  const { x, y } = props.position
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let left = x - rect.width / 2
  let top = y - rect.height - PADDING

  if (left < PADDING) left = PADDING
  if (left + rect.width > viewportWidth - PADDING) left = viewportWidth - rect.width - PADDING

  if (top < PADDING) top = y + PADDING
  if (top + rect.height > viewportHeight - PADDING) top = viewportHeight - rect.height - PADDING

  tooltipStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
  }
}

onMounted(async () => {
  await nextTick()
  updatePosition()
})
</script>
