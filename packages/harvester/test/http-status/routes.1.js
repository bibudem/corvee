function ok(msg) {
    return msg ? msg : 'ok';
}

export default {
    '100': {
        description: "Continue"
    },
    '101': {
        description: "Switching Protocols"
    },
    '102': {
        description: "Processing"
    },
    '200': {
        description: "OK"
    },
    '201': {
        description: "Created"
    },
    '202': {
        description: "Accepted"
    },
    '203': {
        description: "Non-Authoritative Information"
    },
    '204': {
        description: "No Content"
    },
    '205': {
        description: "Reset Content"
    },
    '206': {
        description: "Partial Content"
    },
    '300-header': {
        description: "Multiple Choices",
        routes: [{
            path: '/300-header',
            cb: (req, res) => {
                res
                    .status(300)
                    .set('location', '/300-header-ok')
                    .end();
            }
        }, {
            path: '/300-header-ok',
            cb: (req, res) => {
                res.send(ok());
            }
        }]
    },
    '300-body': {
        description: "Multiple Choices",
        routes: [{
            path: '/300-body',
            cb: (req, res) => {
                res
                    .status(300)
                    .send(`<ul>
                            <li><a href="choix-1.html">choix-1</a></li>
                            <li><a href="choix-2.html">choix-2</a></li>
                    </ul>`);
            }
        }]
    },
    '301': {
        description: "Moved Permanently",
        routes: [{
            path: '/301-no-location',
            cb: (req, res) => {
                res.status(301).end();
            }
        }, {
            path: '/301',
            cb: (req, res) => {
                res.status(301).location('/plain.html').end();
            }
        }]
    },
    '302': {
        description: "Found",
        routes: [{
            path: '/302-without-location-header',
            cb: (req, res) => {
                res.status(302).end();
            }
        }, {
            path: '/302-with-location-header',
            cb: (req, res) => {
                res.status(302).location('/plain.html').end();
            }
        }]
    },
    '303': {
        description: "See Other",
        routes: [{
            path: '/303-without-location-header',
            cb: (req, res) => {
                res.status(303).end();
            }
        }, {
            path: '/303-with-location-header',
            cb: (req, res) => {
                res.status(303).location('/plain.html').end();
            }
        }]
    },
    // '304': {
    //     description: "Not Modified"
    // },
    '305': {
        description: "Use Proxy"
    },
    // '306': {
    //     description: "Unused"
    // },
    '307': {
        description: "Temporary Redirect",
        routes: [{
            path: '/307-without-location-header',
            cb: (req, res) => {
                res.status(307).end();
            }
        }, {
            path: '/307-with-location-header',
            cb: (req, res) => {
                res.status(307).location('/plain.html').end();
            }
        }]
    },
    '308': {
        description: "Permanent Redirect",
        routes: [{
            path: '/308-without-location-header',
            cb: (req, res) => {
                res.status(308).end();
            }
        }, {
            path: '/308-with-location-header',
            cb: (req, res) => {
                res.status(308).location('/plain.html').end();
            }
        }]
    },
    '400': {
        description: "Bad Request"
    },
    '401': {
        description: "Unauthorized"
    },
    '402': {
        description: "Payment Required"
    },
    '403': {
        description: "Forbidden"
    },
    '404': {
        description: "Not Found"
    },
    '405': {
        description: "Method Not Allowed"
    },
    '406': {
        description: "Not Acceptable"
    },
    '407': {
        description: "Proxy Authentication Required"
    },
    '408': {
        description: "Request Timeout"
    },
    '409': {
        description: "Conflict"
    },
    '410': {
        description: "Gone"
    },
    '411': {
        description: "Length Required"
    },
    '412': {
        description: "Precondition Failed"
    },
    '413': {
        description: "Request Entity Too Large"
    },
    '414': {
        description: "Request-URI Too Long"
    },
    '415': {
        description: "Unsupported Media Type"
    },
    '416': {
        description: "Requested Range Not Satisfiable"
    },
    '417': {
        description: "Expectation Failed"
    },
    '418': {
        description: "I'm a teapot"
    },
    '421': {
        description: "Misdirected Request"
    },
    '422': {
        description: "Unprocessable Entity"
    },
    '428': {
        description: "Precondition Required"
    },
    '429': {
        description: "Too Many Requests"
    },
    '431': {
        description: "Request Header Fields Too Large"
    },
    '451': {
        description: "Unavailable For Legal Reasons"
    },
    '500': {
        description: "Internal Server Error"
    },
    '501': {
        description: "Not Implemented"
    },
    '502': {
        description: "Bad Gateway"
    },
    '503': {
        description: "Service Unavailable"
    },
    '504': {
        description: "Gateway Timeout"
    },
    '505': {
        description: "HTTP Version Not Supported"
    },
    '511': {
        description: "Network Authentication Required"
    },
    '520': {
        description: "Web server is returning an unknown error"
    },
    '522': {
        description: "Connection timed out"
    },
    '524': {
        description: "A timeout occurred"
    },
    'plain.html': {
        private: true,
        routes: [{
            path: '/plain.html',
            cb: (req, res) => {
                res.send(ok())
            }
        }]
    }
};

// statuses.codes.forEach(statusCode => {
//     routes['' + statusCode] = 
// })