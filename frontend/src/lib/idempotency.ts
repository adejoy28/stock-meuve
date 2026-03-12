// Generates a UUID v4 idempotency key for each modal session.
// A new key is generated each time a modal opens.
// The same key is reused if the user retries within the same modal session.

export function generateIdempotencyKey(): string {
  // Use crypto.randomUUID if available (modern browsers), fallback otherwise
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
