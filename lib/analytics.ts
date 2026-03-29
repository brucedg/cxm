// Client-side analytics — tracks to both GA4 and server-side

const GA_ID = 'G-J5D0J882DM'

export function trackEvent(name: string, params?: Record<string, string | number>) {
  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, params)
  }

  // Server-side backup (fire and forget)
  if (typeof window !== 'undefined') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: name, event_data: params }),
    }).catch(() => {})
  }
}

export function setAnalyticsUserId(userId: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_ID, { user_id: String(userId) })
  }
}
