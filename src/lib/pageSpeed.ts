export interface PageSpeedMetrics {
  fcp: string
  lcp: string
  cls: string
  tbt: string
  si:  string
}

export interface PageSpeedData {
  mobileScore:  number
  desktopScore: number
  mobile:  PageSpeedMetrics
  desktop: PageSpeedMetrics
}

// In production (Hostinger): no key → requests go through /api/pagespeed.php (PHP proxy)
// In local dev: set NEXT_PUBLIC_PAGESPEED_API_KEY in .env.local to hit Google directly
const PSI_KEY   = process.env.NEXT_PUBLIC_PAGESPEED_API_KEY
const USE_PROXY = !PSI_KEY

function buildUrl(url: string, strategy: string): string {
  if (USE_PROXY) {
    return `/api/pagespeed.php?url=${encodeURIComponent(url)}&strategy=${strategy}`
  }
  return (
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&key=${PSI_KEY}`
  )
}

function extractMetrics(lr: Record<string, unknown>): PageSpeedMetrics {
  const audits = (lr.audits ?? {}) as Record<string, { displayValue?: string }>
  const get = (id: string) => audits[id]?.displayValue ?? '—'
  return {
    fcp: get('first-contentful-paint'),
    lcp: get('largest-contentful-paint'),
    cls: get('cumulative-layout-shift'),
    tbt: get('total-blocking-time'),
    si:  get('speed-index'),
  }
}

export async function getPageSpeed(url: string): Promise<PageSpeedData> {
  const [mRes, dRes] = await Promise.all([
    fetch(buildUrl(url, 'mobile')),
    fetch(buildUrl(url, 'desktop')),
  ])

  if (!mRes.ok || !dRes.ok) throw new Error(`PageSpeed ${mRes.status}/${dRes.status}`)

  const [mData, dData] = await Promise.all([mRes.json(), dRes.json()])

  const score = (d: Record<string, unknown>) =>
    Math.round(((d.lighthouseResult as Record<string, unknown>)
      ?.categories as Record<string, { score: number }>)
      ?.performance?.score * 100) || 0

  return {
    mobileScore:  score(mData),
    desktopScore: score(dData),
    mobile:  extractMetrics(mData.lighthouseResult as Record<string, unknown>),
    desktop: extractMetrics(dData.lighthouseResult as Record<string, unknown>),
  }
}
