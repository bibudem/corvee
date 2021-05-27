import getUrls from 'get-urls'

export const httpStatusHandlers = {
    '300': async function (record, {
        response
    }) {
        // pup response
        const headers = response.headers();
        const body = await response.text();
        const rec = {};
        if ('location' in headers) {
            rec.preferedLocation = headers.location;
        }
        if (body && body.length > 0) {
            const urls = getUrls(body);
            if (urls.entries.length > 0) {
                rec.locations = Array.from(urls);
            }
        }
        if (Object.keys(rec).length > 0) {
            record.records.push(rec)
        }
        return record;
    }
}