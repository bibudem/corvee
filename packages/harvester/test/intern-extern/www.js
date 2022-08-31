import http from 'http';
import {
    URL
} from 'url'
import {
    console
} from '../../../core/lib/logger'

function html(links) {
    return `<html>
    <body>
        <ul>
            ${links.map(link => `<li><a href="${link.href}">${link.name}</a></li>`).join('\n')}
        </ul>
    </body>
</html>`
}

const routes = {
    'http://www.site.com/': [{
        name: 'intern link',
        href: "other-page.html"
    }, {
        name: 'extern link',
        href: 'http://www.site.com/extern'
    }],
    'http://www.site.com/extern': [{
        name: 'home',
        href: '/'
    }, {
        name: 'extern',
        href: 'http://www.other.com'
    }, {
        name: 'extern 303 link',
        href: '/extern-303'
    }],
    'http://www.site.com/other-page.html': [{
        name: 'home',
        href: '/'
    }],
    'http://www.other.com/': [{
        name: 'this page should not be fetched',
        href: '/no-fetch'
    }],
    'http://www.redirected.com/some-page': [{
        name: 'this link should not be followed',
        href: '/no-fetch'
    }],
    'http://www.redirected.com/no-fetch': [{
        name: 'this link should not be followed - home',
        href: '/'
    }]
}

const proxy = http.createServer();

proxy.on('request', (req, res) => {
    const url = req.url
    console.todo(`[proxy] request for ${url}`)
    if (url in routes) {
        return res.end(html(routes[url]))
    }

    if (url === 'http://www.site.com/extern-303') {
        res.statusCode = 303
        res.setHeader('location', 'http://www.redirected.com/some-page')
        return res.end()
    }

    res.end('ok')
})

const starter = (port = 3128) => {
    return new Promise((resolve) => {
        proxy.listen(port, function listen() {
            console.log(`HTTP proxy server listening on port ${port}`);
            resolve()
        });

    })
}

process.on('exit', () => {
    // console.todo(JSON.stringify(Array.from(requestLog), null, 2))
    //console.todo(JSON.stringify(r, null, 2))
})

export default starter