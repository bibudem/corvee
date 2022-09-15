import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import webLogger from 'web-logger'
import hbs from 'hbs'
import routes from './routes.js'

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
        app.use(`/${router.path}`, (req, res) => {
            res.render('index');
        })
    })

app.get(/^\/$/, (req, res) => {
    res.render('index', {
        routes: filteredRoutes,
        home: true
    });
})

//app.listen(3000)

export default app;