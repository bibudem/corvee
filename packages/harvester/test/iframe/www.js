import http from 'node:http'
import esMain from 'es-main'
import { console } from '../../../core/index.js'

function html(page) {

    let iframe = '';
    if ('iframe' in page) {
        iframe = `<p>iframe url: ${page.iframe}</p><iframe src="${page.iframe}" height="500"></iframe>`;
    }
    return `<html>
    <body>
        <ul>
            ${page.links.map(link => `<li><a href="${link.href}"${'target' in link ? ` target="${link.target}"` : ''}>${link.name}</a></li>`).join('\n')}
        </ul>
        ${iframe}
    </body>
</html>`
}

const routes = {
    'http://www.site.com/': {
        links: [{
            name: 'page with iframe',
            href: "iframe-host.html"
        }, {
            name: 'page with iframe 2',
            href: "iframe-host-2.html"
        }, {
            name: 'other page',
            href: 'other-page.html'
        }]
    },
    'http://www.site.com/iframe-host.html': {
        links: [{
            name: 'home',
            href: '/'
        }, {
            name: 'other 2nd page',
            href: 'other-page.html'
        }],
        iframe: 'iframe-page.html'
    },
    'http://www.site.com/iframe-page.html': {
        links: [{
            name: 'home',
            href: '/',
            target: '_top'
        }, {
            name: '2nd embeded page',
            href: 'iframe-page2.html'
        }],
        iframe: 'sub-iframe-page.html'
    },
    'http://www.site.com/sub-iframe-page.html': {
        links: [{
            name: 'home',
            href: '/',
            target: '_top'
        }, {
            name: '2nd sub-embeded page',
            href: 'sub-iframe-page2.html'
        }]
    },
    'http://www.site.com/iframe-host-2.html': {
        links: [{
            name: 'home',
            href: '/'
        }, {
            name: 'other 2nd page',
            href: 'other-page.html'
        }],
        iframe: 'iframe-page.html'
    },
    'http://www.site.com/iframe-page2.html': {
        links: [{
            name: 'home',
            href: '/',
            target: '_top'
        }, {
            name: 'to other 3nd page',
            href: 'other-3nd-page.html'
        }]
    },
    'http://www.site.com/other-page.html': {
        links: [{
            name: 'home',
            href: '/'
        }]
    },
    'http://www.site.com/sub-iframe-page2.html': {
        links: [{
            name: 'home',
            href: '/'
        }]
    },
}

const proxy = http.createServer();

proxy.on('request', (req, res) => {
    const url = req.url
    console.todo(`[proxy] request for ${url}`)
    if (url in routes) {
        return res.end(html(routes[url]))
    }

    res.statusCode = 404;
    res.statusMessage = 'Not found';
    res.end();
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

if (esMain(import.meta)) {
    starter();
}