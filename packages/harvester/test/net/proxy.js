import toxy from 'toxy'

const proxy = toxy()
const port = 3090;

proxy
    .forward('http://localhost:3000')
    .on('proxy:error', function (err) {
        console.error('Error:', err)
    })
    .on('proxyReq', function (proxyReq, req, res, opts) {
        console.log('Proxy request:', req.url, 'to', opts.target)
    })
    .on('proxyRes', function (proxyRes, req, res) {
        console.log('Proxy response:', req.url, 'with status', res.statusCode)
    });

proxy.all('/*')
proxy.listen(port);

console.log('Proxy listening on port', port);