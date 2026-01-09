export const UTC8_TIMEZONE = 'Asia/Shanghai'

export const getDateUTC8 = (): Date => {
  const now = new Date()
  const utc8Str = now.toLocaleString('en-US', { timeZone: UTC8_TIMEZONE })
  return new Date(utc8Str)
}

export const toISOStringUTC8 = (date: Date): string => {
  const utc8Str = date.toLocaleString('en-US', { timeZone: UTC8_TIMEZONE })
  const utc8Date = new Date(utc8Str)
  const year = utc8Date.getFullYear()
  const month = String(utc8Date.getMonth() + 1).padStart(2, '0')
  const day = String(utc8Date.getDate()).padStart(2, '0')
  const hours = String(utc8Date.getHours()).padStart(2, '0')
  const minutes = String(utc8Date.getMinutes()).padStart(2, '0')
  const seconds = String(utc8Date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`
}

export const formatTimeUTC8 = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    timeZone: UTC8_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDateUTC8 = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    timeZone: UTC8_TIMEZONE,
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTimeUTC8 = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    timeZone: UTC8_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const toDateTimeLocalUTC8 = (dateStr: string): string => {
  const date = new Date(dateStr)
  const utc8Str = date.toLocaleString('en-US', { timeZone: UTC8_TIMEZONE })
  const utc8Date = new Date(utc8Str)
  const year = utc8Date.getFullYear()
  const month = String(utc8Date.getMonth() + 1).padStart(2, '0')
  const day = String(utc8Date.getDate()).padStart(2, '0')
  const hours = String(utc8Date.getHours()).padStart(2, '0')
  const minutes = String(utc8Date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
