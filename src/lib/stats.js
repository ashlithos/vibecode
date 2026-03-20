const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function computeStats(events) {
  let totalMeetingMinutes = 0
  let meetingCount = 0
  const dayCount = {}
  const attendeeCount = {}
  const monthlyMinutes = Array(12).fill(0)
  let longestMeetingMinutes = 0
  let longestMeetingName = ''
  let earliestHour = 24
  let latestHour = 0

  DAY_NAMES.forEach((d) => (dayCount[d] = 0))

  for (const event of events) {
    const start = event.start?.dateTime
    const end = event.end?.dateTime
    if (!start || !end) continue // skip all-day events

    const startDate = new Date(start)
    const endDate = new Date(end)
    const durationMin = (endDate - startDate) / 60000
    if (durationMin <= 0 || durationMin > 1440) continue

    meetingCount++
    totalMeetingMinutes += durationMin

    // Track longest meeting
    if (durationMin > longestMeetingMinutes) {
      longestMeetingMinutes = durationMin
      longestMeetingName = event.summary || 'Untitled'
    }

    // Track earliest/latest
    const hour = startDate.getHours()
    if (hour < earliestHour) earliestHour = hour
    const endHour = endDate.getHours()
    if (endHour > latestHour) latestHour = endHour

    // Day of week
    const dayName = DAY_NAMES[startDate.getDay()]
    dayCount[dayName] = (dayCount[dayName] || 0) + 1

    // Monthly
    const month = startDate.getMonth()
    monthlyMinutes[month] += durationMin

    // Attendees
    if (event.attendees) {
      for (const a of event.attendees) {
        if (a.self) continue
        const name = a.displayName || a.email
        attendeeCount[name] = (attendeeCount[name] || 0) + 1
      }
    }
  }

  // Busiest day
  const busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]

  // Top attendee (meeting buddy)
  const sortedAttendees = Object.entries(attendeeCount).sort((a, b) => b[1] - a[1])
  const topBuddy = sortedAttendees[0] || null

  // Busiest month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const busiestMonthIdx = monthlyMinutes.indexOf(Math.max(...monthlyMinutes))

  // Persona derivation
  const persona = derivePersona(totalMeetingMinutes, meetingCount, busiestDay, earliestHour)

  return {
    totalMeetingMinutes,
    totalMeetingHours: Math.round(totalMeetingMinutes / 60),
    meetingCount,
    busiestDay: busiestDay ? { name: busiestDay[0], count: busiestDay[1] } : null,
    topBuddy: topBuddy ? { name: topBuddy[0], count: topBuddy[1] } : null,
    topBuddies: sortedAttendees.slice(0, 5).map(([name, count]) => ({ name, count })),
    busiestMonth: monthNames[busiestMonthIdx],
    busiestMonthHours: Math.round(monthlyMinutes[busiestMonthIdx] / 60),
    monthlyHours: monthlyMinutes.map((m) => Math.round(m / 60)),
    monthNames,
    longestMeeting: { name: longestMeetingName, minutes: Math.round(longestMeetingMinutes) },
    earliestHour,
    latestHour,
    persona,
    avgMeetingsPerDay: Math.round((meetingCount / 365) * 10) / 10,
    avgMeetingLength: meetingCount > 0 ? Math.round(totalMeetingMinutes / meetingCount) : 0,
  }
}

function derivePersona(totalMinutes, count, busiestDay, earliestHour) {
  const hours = totalMinutes / 60

  if (hours > 1500) {
    return { title: 'The Calendar Warrior', emoji: '🗡️', description: "You practically live in meetings. Your calendar isn't a tool — it's a lifestyle." }
  }
  if (hours > 800) {
    return { title: 'The Connector', emoji: '🔗', description: 'You thrive on collaboration. Half your workweek is spent bringing people together.' }
  }
  if (earliestHour <= 7) {
    return { title: 'The Early Bird', emoji: '🌅', description: 'Sunrise meetings? No problem. You get more done before 9 AM than most do all day.' }
  }
  if (busiestDay && busiestDay[0] === 'Monday') {
    return { title: 'The Monday Maestro', emoji: '🎯', description: 'You kick off every week at full throttle. Mondays fear you.' }
  }
  if (busiestDay && busiestDay[0] === 'Friday') {
    return { title: 'The Friday Closer', emoji: '🎬', description: "While others wind down, you're wrapping things up. Nothing slips past you into the weekend." }
  }
  if (count < 100) {
    return { title: 'The Deep Worker', emoji: '🧘', description: 'Fewer meetings, more focus. You protect your time like a vault.' }
  }
  return { title: 'The Team Player', emoji: '🤝', description: 'A balanced calendar and a collaborative spirit. You show up when it matters.' }
}
