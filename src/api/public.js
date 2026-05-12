function getBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return String(raw).replace(/\/$/, '')
}

/** URL absoluta para imágenes servidas por el API (/uploads/...). En dev, Vite puede proxy /uploads. */
export function resolvePublicMediaUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (import.meta.env.DEV && path.startsWith('/')) {
    return path
  }
  const base = getBaseUrl()
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function formatErrorDetail(res, bodyText) {
  let detail = bodyText?.trim() || res.statusText || `HTTP ${res.status}`
  try {
    const j = JSON.parse(bodyText)
    if (typeof j.detail === 'string') {
      detail = j.detail
    } else if (Array.isArray(j.detail)) {
      detail = j.detail.map((e) => e.msg || JSON.stringify(e)).join('; ')
    } else if (j.detail != null) {
      detail = typeof j.detail === 'object' ? JSON.stringify(j.detail) : String(j.detail)
    }
  } catch {
    /* use detail as text */
  }
  return detail
}

async function parseJsonResponse(res) {
  const text = await res.text()
  if (res.ok) {
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('Respuesta inválida del servidor (no es JSON)')
    }
  }
  throw new Error(formatErrorDetail(res, text))
}

/**
 * @param {string} path - e.g. /api/public/cotizaciones/catalogo
 */
export async function publicGet(path) {
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  return parseJsonResponse(res)
}

/**
 * @param {string} path
 * @param {object} body - serializado como JSON
 */
export async function publicPost(path, body) {
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return parseJsonResponse(res)
}
