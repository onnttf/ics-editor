<template>
  <div
    class="h-dvh flex flex-col bg-slate-50 selection:bg-blue-100 selection:text-blue-900 font-sans overflow-hidden antialiased"
  >
    <EventEditor
      v-if="activeEvent"
      :event="activeEvent"
      :is-new="!!draftEvent"
      @confirm="handleConfirmUpdate"
      @cancel="handleCancelEdit"
      @delete="handleDeleteEvent"
    />

    <DateEventsModal
      v-if="dayEventsModalDate"
      :date="dayEventsModalDate"
      :events="filteredDayEvents"
      @close="dayEventsModalDate = null"
      @select="handleSelectEvent"
      @add-event="handleAddEventFromModal"
    />

    <header
      class="bg-white border-b border-slate-200 shrink-0 px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between shadow-sm z-30"
    >
      <div class="flex items-center gap-3 md:gap-4">
        <div
          class="bg-blue-600 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-all hover:scale-105"
        >
          <i class="fa-solid fa-calendar-days text-xl md:text-2xl"></i>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-black tracking-tighter text-slate-900 leading-none">
            VentiCal
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <button
          @click="fileInputRef?.click()"
          class="px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600 border border-transparent rounded-lg hover:bg-blue-50/50 transition-all flex items-center gap-2"
        >
          <i class="fa-solid fa-file-import opacity-70"></i>
          <span class="hidden md:inline">Import</span>
        </button>
        <input
          ref="fileInputRef"
          type="file"
          @change="handleFileUpload"
          accept=".ics"
          class="hidden"
        />

        <button
          @click="handleDownload"
          :disabled="events.length === 0"
          class="px-4 py-2.5 md:px-6 md:py-2.5 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95"
        >
          <i class="fa-solid fa-cloud-arrow-down"></i>
          <span class="hidden md:inline">Export</span>
          <span class="md:hidden">Export</span>
        </button>
      </div>
    </header>

    <main
      class="flex-1 overflow-hidden flex flex-col lg:flex-row px-4 md:px-6 lg:px-8 py-4 md:py-6 gap-4 md:gap-6"
    >
      <div
        class="lg:hidden flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm shrink-0"
      >
        <button
          @click="activeMobileView = 'calendar'"
          class="flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          :class="[
            activeMobileView === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400',
          ]"
        >
          Calendar
        </button>
        <button
          @click="activeMobileView = 'list'"
          class="flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          :class="[
            activeMobileView === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400',
          ]"
        >
          Events
        </button>
      </div>

      <aside
        class="flex flex-col gap-4 md:gap-6 w-full lg:w-80 xl:w-96 shrink-0 flex-1 lg:flex-none lg:h-full overflow-hidden min-h-0"
        :class="[activeMobileView === 'list' ? 'flex' : 'hidden', 'lg:flex']"
      >
        <section class="bg-white rounded-lg p-4 md:p-6 border border-slate-200 shadow-sm shrink-0">
          <h3
            class="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-2"
          >
            <i class="fa-solid fa-bolt text-amber-400"></i>
            <span>Quick Add</span>
          </h3>
          <form @submit="handleSmartAdd" class="relative">
            <textarea
              v-model="aiInput"
              rows="2"
              placeholder="Paste lists or describe events..."
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-sm text-slate-700 resize-none"
            />
            <button
              type="submit"
              :disabled="isAiLoading || !aiInput.trim()"
              class="absolute right-2 bottom-2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-90"
            >
              <i
                :class="`fa-solid ${isAiLoading ? 'fa-spinner animate-spin' : 'fa-magic'} text-sm`"
              ></i>
            </button>
          </form>
        </section>

        <section
          class="bg-white rounded-lg p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-0"
        >
          <div class="flex justify-between items-center mb-4 md:mb-6 shrink-0">
            <h2 class="text-lg md:text-xl font-black text-slate-900 tracking-tight">
              {{
                dayEventsModalDate
                  ? `${dayEventsModalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Events`
                  : 'All Events'
              }}
            </h2>
            <button
              v-if="dayEventsModalDate"
              @click="dayEventsModalDate = null"
              class="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-xs font-bold uppercase"
            >
              <i class="fa-solid fa-times mr-1"></i> Clear
            </button>
            <button
              v-else
              @click="handleAddEvent()"
              class="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold uppercase"
            >
              <i class="fa-solid fa-plus mr-1"></i> Add
            </button>
          </div>

          <div class="flex-1 min-h-0 relative">
            <EventList
              ref="eventListRef"
              :events="events"
              :selected-id="selectedId"
              @select="handleSelectEvent"
            />
          </div>
        </section>
      </aside>

      <section
        class="flex-1 lg:h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0"
        :class="[activeMobileView === 'calendar' ? 'flex' : 'hidden', 'lg:flex']"
      >
        <CalendarView
          ref="calendarViewRef"
          :events="events"
          @select-event="handleSelectEvent"
          @add-event="handleAddEvent"
          @click-date="handleClickDate"
        />
      </section>
    </main>

    <footer class="bg-white border-t border-slate-200 py-3 px-4 md:px-6 lg:px-8 shrink-0 z-10">
      <div
        class="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400"
      >
        <div class="flex items-center gap-4 md:gap-6">
          <span class="hidden sm:inline">Local First</span>
        </div>
        <span>© 2026 VentiCal</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { IcsEvent } from './types'
import { parseIcsContent, generateIcsString } from './utils/icsHelper'
import { smartParseEvents } from './services/geminiService'
import { getDateUTC8 } from './utils/timezoneHelper'
import EventList from './components/EventList.vue'
import EventEditor from './components/EventEditor.vue'
import CalendarView from './components/CalendarView.vue'
import DateEventsModal from './components/DateEventsModal.vue'

type EventListRef = InstanceType<typeof EventList> & {
  scrollToEvent: (eventId: string) => void
}

type CalendarViewRef = InstanceType<typeof CalendarView> & {
  navigateToDate: (date: Date) => void
}

const events = ref<IcsEvent[]>([])
const selectedId = ref<string | null>(null)
const draftEvent = ref<IcsEvent | null>(null)
const isAiLoading = ref(false)
const aiInput = ref('')
const activeMobileView = ref<'calendar' | 'list'>('calendar')
const fileInputRef = ref<HTMLInputElement | null>(null)
const calendarViewRef = ref<CalendarViewRef | null>(null)
const eventListRef = ref<EventListRef | null>(null)
const dayEventsModalDate = ref<Date | null>(null)
const pendingScrollEventId = ref<string | null>(null)

onMounted(() => {
  const saved = sessionStorage.getItem('ventical_events')
  if (saved) {
    try {
      events.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load saved state', e)
    }
  }
})

watch(
  events,
  (newEvents) => {
    sessionStorage.setItem('ventical_events', JSON.stringify(newEvents))
  },
  { deep: true },
)

watch(activeMobileView, (newView) => {
  if (newView === 'list' && pendingScrollEventId.value) {
    setTimeout(() => {
      eventListRef.value?.scrollToEvent(pendingScrollEventId.value!)
      pendingScrollEventId.value = null
    }, 100)
  }
})

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result as string
    const parsed = parseIcsContent(content)
    events.value = [...events.value, ...parsed]
  }
  reader.readAsText(file)
}

const handleDownload = () => {
  const icsContent = generateIcsString(events.value)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'calendar_export.ics'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleAddEvent = (date?: Date) => {
  const start = date ? new Date(date) : getDateUTC8()

  if (date) {
    start.setHours(9, 0, 0, 0)
  } else {
    start.setMinutes(0, 0, 0)
    start.setHours(start.getHours() + 1)
  }

  const end = new Date(start.getTime() + 3600000)

  const newEvent: IcsEvent = {
    id: crypto.randomUUID(),
    summary: 'New Meeting',
    start: start.toISOString(),
    end: end.toISOString(),
    description: '',
    location: '',
    uid: crypto.randomUUID(),
  }

  draftEvent.value = newEvent
  selectedId.value = null
}

const handleClickDate = (date: Date) => {
  dayEventsModalDate.value = date

  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  const dayEvents = events.value.filter((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    return eventStart < dayEnd && eventEnd > dayStart
  })

  if (dayEvents.length > 0) {
    const firstEvent = [...dayEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    )[0]
    if (firstEvent) {
      if (window.innerWidth >= 1024) {
        setTimeout(() => {
          eventListRef.value?.scrollToEvent(firstEvent.id)
        }, 100)
      } else {
        pendingScrollEventId.value = firstEvent.id
      }
    }
  }
}

const handleAddEventFromModal = () => {
  const date = dayEventsModalDate.value
  if (date) {
    handleAddEvent(date)
    dayEventsModalDate.value = null
  }
}

const handleSmartAdd = async (e: Event) => {
  e.preventDefault()
  if (!aiInput.value.trim()) return

  isAiLoading.value = true
  try {
    const results = await smartParseEvents(aiInput.value)
    if (results.length > 0) {
      const first = results[0]
      if (!first) {
        return
      }
      const newEvent: IcsEvent = {
        id: crypto.randomUUID(),
        summary: first.summary || 'AI Generated Event',
        start: first.start || new Date().toISOString(),
        end: first.end || new Date(Date.now() + 3600000).toISOString(),
        description: first.description || '',
        location: first.location || '',
        uid: crypto.randomUUID(),
      }

      if (results.length > 1) {
        const others = results.slice(1).map((p) => ({
          id: crypto.randomUUID(),
          summary: p.summary || 'AI Generated Event',
          start: p.start || new Date().toISOString(),
          end: p.end || new Date(Date.now() + 3600000).toISOString(),
          description: p.description || '',
          location: p.location || '',
          uid: crypto.randomUUID(),
        }))
        events.value = [...events.value, ...others]
      }

      draftEvent.value = newEvent
      selectedId.value = null
      aiInput.value = ''
    }
  } catch (err) {
    console.error(err)
  } finally {
    isAiLoading.value = false
  }
}

const handleConfirmUpdate = (updated: IcsEvent) => {
  if (draftEvent.value) {
    events.value = [...events.value, updated]
    draftEvent.value = null
  } else {
    events.value = events.value.map((e) => (e.id === updated.id ? updated : e))
    selectedId.value = null
  }
}

const handleDeleteEvent = (id: string) => {
  events.value = events.value.filter((e) => e.id !== id)
  selectedId.value = null
  draftEvent.value = null
}

const handleSelectEvent = (id: string) => {
  const event = events.value.find((e) => e.id === id)
  if (event) {
    draftEvent.value = null
    selectedId.value = id

    const eventDate = new Date(event.start)
    calendarViewRef.value?.navigateToDate(eventDate)
  }
}

const handleCancelEdit = () => {
  selectedId.value = null
  draftEvent.value = null
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !activeEvent.value && dayEventsModalDate.value) {
    dayEventsModalDate.value = null
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const activeEvent = computed(
  () => draftEvent.value || events.value.find((e) => e.id === selectedId.value),
)

const filteredDayEvents = computed(() => {
  if (!dayEventsModalDate.value) return []

  const dayStart = new Date(
    dayEventsModalDate.value.getFullYear(),
    dayEventsModalDate.value.getMonth(),
    dayEventsModalDate.value.getDate(),
  )
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  return events.value.filter((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    return eventStart < dayEnd && eventEnd > dayStart
  })
})
</script>
