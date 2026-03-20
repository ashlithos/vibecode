const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

export async function fetchAllCalendarEvents(accessToken) {
  const now = new Date()
  const oneYearAgo = new Date(now)
  oneYearAgo.setFullYear(now.getFullYear() - 1)

  const timeMin = oneYearAgo.toISOString()
  const timeMax = now.toISOString()

  let allEvents = []
  let pageToken = null

  do {
    const url = new URL(`${CALENDAR_API}/calendars/primary/events`)
    url.searchParams.set('timeMin', timeMin)
    url.searchParams.set('timeMax', timeMax)
    url.searchParams.set('maxResults', '2500')
    url.searchParams.set('singleEvents', 'true')
    url.searchParams.set('orderBy', 'startTime')
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = body?.error?.message || `Calendar API returned ${res.status}`
      throw new Error(`Failed to fetch calendar events: ${msg}`)
    }

    const data = await res.json()
    const items = data.items || []
    allEvents = allEvents.concat(items)
    pageToken = data.nextPageToken || null
  } while (pageToken)

  return allEvents
}
