import path from 'path'
import express from 'express';
import routes from './routes';
import webLogger from 'web-logger'
import hbs from 'hbs'
import _ from 'underscore';
import isNumber from 'is-number'

import harvesterConfig, {
    server as config
} from './config'

import {
    console
}
    from '../../../core/lib/logger';

const app = express();

app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'html');
app.engine('html', hbs.__express)

app.use(webLogger({
    logDirectory: path.join(__dirname, 'logs')
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