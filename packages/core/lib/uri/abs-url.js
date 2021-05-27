import {
    console
} from '../../../core'

export function absUrl(url, baseUrl) {
    let newUrl;
    try {
        newUrl = new URL(url, baseUrl)
        return newUrl.href;
    } catch (e) {
        console.error(e)
        process.exit()
    }
}