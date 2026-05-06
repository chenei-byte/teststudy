const PREFIX = 'studyOrganizer.'

export function load(key, defaultValue) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return defaultValue
    return JSON.parse(raw)
  } catch {
    return defaultValue
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* quota or private mode */
  }
}
