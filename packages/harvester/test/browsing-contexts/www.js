import http from 'node:http'
import esMain from 'es-main'
import { console } from '../../../core/index.js'

const routes = {
    '/': {
        links: [{
            name: 'iframe-host-1.html',
            href: "iframe-host-1.html"
        }, {
            name: 'iframe-host-2.html',
            href: "iframe-host-2.html"
        }, {
            name: 'other page',
            href: 'other-page.html'
        }]
    },
    '/iframe-host-1.html': {
        links: [{
            name: 'home',
            href: '/'
        }, {
            name: 'other-page.html',
            href: 'other-page.html'
        }],
        iframes: ['iframe-host-1.1.html']
    },
    '/iframe-host-1.1.html': {
        links: [{
            name: 'home',
            href: '/',
            target: '_top'
        }, {
            name: 'iframe-page2.html',
            href: 'iframe-page2.html'
        }],
        iframes: ['iframe-page-1.1.1.html']
    },
    '/iframe-page-1.1.1.html': {
        links: [{
            name: 'home',
            href: '/',
            target: '_top'
        }],
        iframes: ['iframe-page-1.1.1.1.html']
    },
    '/iframe-page-1.1.1.1.html': {
        links: [{
            name: 'home',
            href: '/',
            target: '_top'
        }],
        iframes: ['nothing-to-see-here.html']
    },
    '/iframe-host-2.html': {
        links: [{
            name: 'home',
            href: '/'
        }, {
            name: 'other-page.html',
            href: 'other-page.html'
        }],
        iframes: ['nothing-to-see-here.html', 'iframe-page-2.html']
    },
    '/iframe-page-2.html': {
        links: [{
            name: 'home',
            href: '/',
            target: '_top'
        }, {
            name: 'Nothing to see here',
            href: 'nothing-to-see-here.html'
        }],
        iframes: ['other-page.html']
    },
    '/other-page.html': {
        links: [{
            name: 'home',
            href: '/'
        }],
        iframes: ['iframe-page-1.1.1.1.html']
    },
    '/sub-iframe-page2.html': {
        links: [{
            name: 'home',
            href: '/'
        }]
    },
}

function html(pageUrl, page) {

    let iframes = [];
    if ('iframes' in page) {
        iframes = page.iframes.map(iframe => `<p></p><iframe src="${iframe}" height="400"></iframe>`);
    }
    return `<html>
    <body>
        <p><code>${pageUrl}</code></p>
        <ul>
            ${page.links.map(link => `<li><a href="${link.href}"${'target' in link ? ` target="${link.target}"` : ''}>${link.name}</a></li>`).join('\n')}
        </ul>
        ${iframes.join('\n')}
    </body>
</html>`
}

const proxy = http.createServer();

proxy.on('request', (req, res) => {
    const url = req.url
    console.debug(`[server] request for ${url}`)
    if (url in routes) {
        return res.end(html(url, routes[url]))
    }

    res.statusCode = 404;
    res.statusMessage = 'Not found';
    res.end(`<p><code>${url}</code></p><p>Nothing to see here.</p>`);
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

//
//
//

if (esMain(import.meta)) {
    starter();
}