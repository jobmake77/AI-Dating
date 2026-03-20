export function getEventActionCutoff(startTime: string, endTime?: string | null) {
  const start = new Date(startTime)
  const endOfEventDay = new Date(start)
  endOfEventDay.setHours(23, 59, 59, 999)

  if (!endTime) {
    return endOfEventDay
  }

  const explicitEnd = new Date(endTime)

  if (Number.isNaN(explicitEnd.getTime())) {
    return endOfEventDay
  }

  return explicitEnd.getTime() < endOfEventDay.getTime() ? explicitEnd : endOfEventDay
}

export function hasEventEnded(startTime: string, endTime?: string | null, now: Date = new Date()) {
  return now.getTime() > getEventActionCutoff(startTime, endTime).getTime()
}
