import crypto from 'node:crypto'
import { normalizeUrl } from "../uri/index.js"

/**
 * @param {string} payload
 */
function hashPayload(payload) {
  return crypto
    .createHash('sha256')
    .update(payload)
    .digest('base64')
    .replace(/(\+|\/|=)/g, '')
    .substring(0, 8);
}

/**
 *
 *
 * @export
 * @param {object} urlData
 * @param {string} urlData.url
 * @param {string} urlData.method
 * @param {string} urlData.payload
 * @param {boolean} urlData.keepUrlFragment
 * @param {boolean} urlData.useExtendedUniqueKey
 * @returns {string} uniqueKey
 */
export function computeUniqueKey({ url, method, payload, keepUrlFragment, useExtendedUniqueKey }) {
  const normalizedMethod = method.toUpperCase();
  const normalizedUrl = normalizeUrl(url, keepUrlFragment) || url; // It returns null when url is invalid, causing weird errors.
  if (!useExtendedUniqueKey) {
    return normalizedUrl;
  }
  const payloadHash = payload ? hashPayload(payload) : '';
  return `${normalizedMethod}(${payloadHash}):${normalizedUrl}`;
}