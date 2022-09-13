import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import webLogger from 'web-logger'
import hbs from 'hbs'
import { isNumber } from 'underscore'
import routes from './routes.1.js'
import harvesterConfig, { server as config } from './config.js'
import { console } from '../../../core/index.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const app = express();

app.disable('x-powered-by');
app.set('views', join(DIRNAME, 'views'))
app.set('view engine', 'html');
app.engine('html', hbs.__express)

app.use(webLogger({
    logDirectory: join(DIRNAME, 'logs')
}));

// const filteredRoutes = routes.filter(route => ['200-with-2000ms-delay', '301-with-2000ms-delay'].includes(route.path));
const filteredRoutes = routes //.slice(12, 24);

routes
    .forEach(router => {
        if ('cb' in router) {
            app.use(`/${router.path}`, router.cb)
        } else {
            const status = 'status' in router ? router.status : isNumber(router.path) ? router.path : 200;
            app.use(`/${router.path}`, (req, res) => res.status(status).send(router.description))
        }
    })

app.get((req, res, next) => {
    console.warn(`[GET] ${req.originalUrl}`)
    next();
})

app.get(/^\/$/, (req, res) => {
    res.render('index', {
        routes: filteredRoutes,
        checkExtern: harvesterConfig.checkExtern
    });
})

const server = (port = config.port) => {
    return new Promise((resolve) => {
        app.listen(port, function listen() {
            console.log(`HTTP proxy server listening on port ${port}`);
            resolve()
        })
    })
}

if (!module.parent) {
    server();
}


export default server;