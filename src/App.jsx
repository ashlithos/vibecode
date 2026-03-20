import { useState, useEffect, useCallback } from 'react'
import LandingPage from './components/LandingPage'
import LoadingScreen from './components/LoadingScreen'
import StoryUI from './components/StoryUI'
import ErrorScreen from './components/ErrorScreen'
import { fetchAllCalendarEvents } from './lib/calendar'
import { computeStats } from './lib/stats'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

export default function App() {
  const [phase, setPhase] = useState('landing')
  const [accessToken, setAccessToken] = useState(null)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const token = params.get('access_token')
      const errorParam = params.get('error')
      if (errorParam) {
        setError(`Google OAuth error: ${errorParam}`)
        setPhase('error')
        window.history.replaceState(null, '', window.location.pathname)
        return
      }
      if (token) {
        setAccessToken(token)
        setPhase('loading')
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [])

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false

    async function load() {
      try {
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (userRes.ok) {
          const userInfo = await userRes.json()
          if (!cancelled) setUserName(userInfo.given_name || userInfo.name || '')
        }

        const events = await fetchAllCalendarEvents(accessToken)
        if (cancelled) return

        if (!events || events.length === 0) {
          setError(
            'No calendar events found for the past year. Make sure your Google Calendar has events and you granted calendar access.'
          )
          setPhase('error')
          return
        }

        const computed = computeStats(events)
        setStats(computed)
        setPhase('story')
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch calendar data.')
          setPhase('error')
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [accessToken])

  const handleSignIn = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError(
        'Google Client ID is not configured. Create a .env file with VITE_GOOGLE_CLIENT_ID=your_client_id. See SETUP.md for details.'
      )
      setPhase('error')
      return
    }

    const redirectUri = window.location.origin + window.location.pathname
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'token')
    authUrl.searchParams.set('scope', SCOPES)
    authUrl.searchParams.set('include_granted_scopes', 'true')
    authUrl.searchParams.set('prompt', 'consent')

    window.location.href = authUrl.toString()
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    setPhase('landing')
    setAccessToken(null)
    setStats(null)
  }, [])

  switch (phase) {
    case 'landing':
      return <LandingPage onSignIn={handleSignIn} />
    case 'loading':
      return <LoadingScreen />
    case 'story':
      return <StoryUI stats={stats} userName={userName} />
    case 'error':
      return <ErrorScreen error={error} onRetry={handleRetry} />
    default:
      return null
  }
}
