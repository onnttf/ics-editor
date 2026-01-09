export interface IcsEvent {
  id: string
  summary: string
  start: string
  end: string
  description: string
  location: string
  color?: string
  attendees?: string[]
  uid?: string
  created?: string
}

export interface AppState {
  events: IcsEvent[]
  selectedEventId: string | null
  isEditing: boolean
  searchQuery: string
}
