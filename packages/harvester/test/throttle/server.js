import path from 'path'
import express from 'express';
import routes from './routes';
import webLogger from 'web-logger'
import hbs from 'hbs'
import _ from 'underscore';
import { isNumber } from 'underscore'

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

app.get(/^\/$/, (req, res) => {
    res.render('index', {
        routes: filteredRoutes
        //routes
    });
})

//app.listen(3000)

export default app;