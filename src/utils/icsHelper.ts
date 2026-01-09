import type { IcsEvent } from '../types'

export const toIcsDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export const fromIcsDate = (icsDate: string): string => {
  const year = icsDate.substring(0, 4)
  const month = icsDate.substring(4, 6)
  const day = icsDate.substring(6, 8)
  const hour = icsDate.substring(9, 11)
  const min = icsDate.substring(11, 13)
  const sec = icsDate.substring(13, 15)
  return `${year}-${month}-${day}T${hour}:${min}:${sec}.000Z`
}

export const parseIcsContent = (content: string): IcsEvent[] => {
  const events: IcsEvent[] = []
  const rawLines = content.split(/\r?\n/)
  const lines: string[] = []
  let currentLine = ''

  for (const rawLine of rawLines) {
    if (rawLine.startsWith(' ') || rawLine.startsWith('\t')) {
      currentLine += rawLine.substring(1)
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = rawLine
    }
  }
  if (currentLine) lines.push(currentLine)

  let currentEvent: Partial<IcsEvent> | null = null

  lines.forEach((line) => {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { id: crypto.randomUUID() }
    } else if (line.startsWith('END:VEVENT') && currentEvent) {
      events.push(currentEvent as IcsEvent)
      currentEvent = null
    } else if (currentEvent) {
      const [key, ...rest] = line.split(':')
      const value = rest.join(':')

      if (key && key.startsWith('SUMMARY')) currentEvent.summary = value
      if (key && key.startsWith('DTSTART')) currentEvent.start = fromIcsDate(value)
      if (key && key.startsWith('DTEND')) currentEvent.end = fromIcsDate(value)
      if (key && key.startsWith('DESCRIPTION')) currentEvent.description = value
      if (key && key.startsWith('LOCATION')) currentEvent.location = value
      if (key && key.startsWith('UID')) currentEvent.uid = value
      if (key && key.startsWith('COLOR')) currentEvent.color = value
    }
  })

  return events
}

export const generateIcsString = (events: IcsEvent[]): string => {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VentiCal//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  events.forEach((event) => {
    ics.push('BEGIN:VEVENT')
    ics.push(`UID:${event.uid || event.id}`)
    ics.push(`DTSTAMP:${toIcsDate(new Date().toISOString())}`)
    ics.push(`DTSTART:${toIcsDate(event.start)}`)
    ics.push(`DTEND:${toIcsDate(event.end)}`)
    ics.push(`SUMMARY:${event.summary}`)
    if (event.description) ics.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`)
    if (event.location) ics.push(`LOCATION:${event.location}`)
    if (event.color) ics.push(`COLOR:${event.color}`)
    ics.push('END:VEVENT')
  })

  ics.push('END:VCALENDAR')
  return ics.join('\r\n')
}
