import crypto from 'node:crypto'

/**
 * @param {string} url
 */
export function idFromUrl(url) {
    return crypto
        .createHash('sha256')
        .update(url)
        .digest('hex');
}