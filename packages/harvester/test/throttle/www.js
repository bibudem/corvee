import http from 'http';
import {
    console
} from '../../../core/lib/logger'

const proxy = http.createServer();

const requestLog = new Map()

const r = []

let lastReqTime = 0;

function getTimeFromLast(currentReqTime) {
    let diff = lastReqTime;
    if (lastReqTime) {
        diff = currentReqTime - lastReqTime
    }

    lastReqTime = currentReqTime;

    return diff;
}

proxy.on('request', (req, res) => {
    const now = Date.now()
    const time = now - proxy.startTime
    const timeFromLast = getTimeFromLast(now)

    r.push(timeFromLast)

    console.todo(`[${Math.round(timeFromLast / 100) / 10}] request for ${req.url}`)
    res.end('ok')
})

const starter = (port = 3128) => {
    return new Promise((resolve, reject) => {
        proxy.listen(port, function () {
            console.log(`HTTP proxy server listening on port ${port}`);
            proxy.startTime = Date.now();
            resolve()
        });

    })
}

process.on('exit', () => {
    // console.todo(JSON.stringify(Array.from(requestLog), null, 2))
    console.todo(JSON.stringify(r, null, 2))
})

export default starter