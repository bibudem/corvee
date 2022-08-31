import http from 'http';
import faker from 'faker';
import urlSlug from 'url-slug';
import {
    server as config
} from './config'

import {
    console
} from '../../../core/lib/logger'

console.log('starting...')

var countRoutes = 0;

function html(links) {
    var content = links.length ? `
                <p><a href="..">&nbsp;..&nbsp;</a></p>
                <ul>
                    ${links.map(link => `<li><a href="${link.path.replace(config.origin, '')}">${link.name}</a></li>`).join('\n')}
                </ul>` :
        `<p>End of branch</p>`;

    return `<html>
        <body>
            ${content}
        </body>
    </html>`
}

function wait(millis) {
    return new Promise(res => setTimeout(res, millis));
};

function createRoutes(args, currentDepth = 1) {

    const name = currentDepth === 1 ? '' : args.name();
    const path = `${args.baseUrl}${urlSlug(name)}/`;
    countRoutes++;

    args.routes[path] = [];

    if (args.currentParent) {
        args.routes[args.currentParent].push({
            name,
            path
        })
    }

    args.currentParent = path;

    if (currentDepth < args.depth) {
        for (var i = 0; i < args.spread; i++) {
            createRoutes({
                ...args,
                baseUrl: path
            }, currentDepth + 1);
        }
    }

    return args;
}

function makeRoutes(args) {
    args.depth = args.depth === undefined ? 1 : args.depth;
    args.spread = args.spread === undefined ? 1 : args.spread;
    args.name = args.name || function () {
        return faker.random.word();
    };
    args.baseUrl = config.origin;
    args.routes = {};

    return createRoutes(args).routes;
};

const routes = makeRoutes({
    depth: config.depth,
    spread: config.spread
});

const routesKeys = Object.keys(routes);
for (var route in routes) {
    // Add random intern links
    var keys = [];
    while (keys.length < 3) {
        var randKeyIdx = Math.floor(Math.random() * routesKeys.length);
        if (!keys.includes(randKeyIdx)) {
            keys.push(randKeyIdx)
        }
    }
    keys.forEach((keyIdx, i) => {
        routes[route].push({
            name: `intern-${i}`,
            path: routesKeys[keyIdx]
        })
    })
}

console.log(`website generated:`);
console.log(`depth: ${config.depth}`)
console.log(`spread: ${config.spread}`)
console.log(`${countRoutes} routes created.`)

if (!module.parent) {
    console.log(routes)
}

const proxy = http.createServer();

proxy.on('request', async (req, res) => {
    const isProxied = req.headers['proxy-connection'],
        url = isProxied ? `${req.url.replace(/\/$/, '')}/` : `${config.origin}${req.url}`;
    // console.todo(`[proxy] request for ${url} / ${req.headers['user-agent']}`)
    if (url in routes) {
        return res.end(html(routes[url]));
    }

    res.statusCode = 404;
    res.statusMessage = 'Not found';
    res.end();
})

const starter = (port = config.proxyPort) => {
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

if (!module.parent) {
    starter();
}

export default starter