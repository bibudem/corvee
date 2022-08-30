import crypto from 'crypto'
import { normalizeUrl } from "../uri"

function hashPayload(payload) {
  return crypto
    .createHash('sha256')
    .update(payload)
    .digest('base64')
    .replace(/(\+|\/|=)/g, '')
    .substr(0, 8);
}

export function computeUniqueKey({ url, method, payload, keepUrlFragment, useExtendedUniqueKey }) {
  const normalizedMethod = method.toUpperCase();
  const normalizedUrl = normalizeUrl(url, keepUrlFragment) || url; // It returns null when url is invalid, causing weird errors.
  if (!useExtendedUniqueKey) {
    if (normalizedMethod !== 'GET' && payload) {
      // Using log.deprecated to log only once. We should add log.once or some such.
      log.deprecated(`We've encountered a ${normalizedMethod} Request with a payload. `
        + 'This is fine. Just letting you know that if your requests point to the same URL '
        + 'and differ only in method and payload, you should see the "useExtendedUniqueKey" option of Request constructor.');
    }
    return normalizedUrl;
  }
  const payloadHash = payload ? hashPayload(payload) : '';
  return `${normalizedMethod}(${payloadHash}):${normalizedUrl}`;
}