import crypto from 'node:crypto'

export function idFromUrl(url) {
    return crypto
        .createHash('sha256')
        .update(url)
        .digest('hex');
}