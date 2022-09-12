import { createHash } from 'node:crypto'
import { normalizeUrl } from "../../../core/lib/index.js";

function hashPayload(payload) {
  return createHash('sha256').update(payload).digest('base64').replace(/(\+|\/|=)/g, '').substr(0, 8);
}

export function computeUniqueKey({
  url,
  method,
  payload,
  keepUrlFragment,
  useExtendedUniqueKey
}) {
  const normalizedMethod = method.toUpperCase();
  const normalizedUrl = (0, normalizeUrl)(url, keepUrlFragment) || url; // It returns null when url is invalid, causing weird errors.

  if (!useExtendedUniqueKey) {
    return normalizedUrl;
  }

  const payloadHash = payload ? hashPayload(payload) : '';
  return `${normalizedMethod}(${payloadHash}):${normalizedUrl}`;
}