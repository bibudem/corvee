function ok(msg) {
    return msg ? msg : 'ok';
}

export default [{
        path: '100',
        description: "Continue"
    },
    {
        path: '101',
        description: "Switching Protocols"
    },
    {
        path: '102',
        description: "Processing"
    },
    {
        path: '200',
        description: "OK"
    },
    {
        path: '200-with-2000ms-delay',
        description: "OK",
        cb: (req, res) => {
            setTimeout(() => {
                res
                    .status(200)
                    .end();
            }, 2000)
        }
    },
    {
        path: '201',
        description: "Created"
    },
    {
        path: '202',
        description: "Accepted"
    },
    {
        path: '203',
        description: "Non-Authoritative Information"
    },
    {
        path: '204',
        description: "No Content"
    },
    {
        path: '205',
        description: "Reset Content"
    },
    {
        path: '206',
        description: "Partial Content"
    },
    {
        path: '300-header',
        description: "Multiple Choices",
        cb: (req, res) => {
            res
                .status(300)
                .set('location', '/300-header-ok')
                .end();
        }
    },
    {
        path: '300-header-ok',
        private: true,
        cb: (req, res) => {
            res.send(ok());
        }
    },
    {
        path: '300-body',
        description: "Multiple Choices",
        cb: (req, res) => {
            res
                .status(300)
                .send(`<ul>
                            <li><a href="choix-1.html">choix-1</a></li>
                            <li><a href="choix-2.html">choix-2</a></li>
                    </ul>`);
        }
    },
    {
        path: '301-with-2000ms-delay',
        description: "Moved Permanently",
        cb: (req, res) => {
            setTimeout(() => {
                res.status(301).location('/plain.html').end();
            }, 2000)
        }
    },
    {
        path: '301-with-location-header',
        description: "Moved Permanently",
        cb: (req, res) => {
            res.status(301).location('/plain.html').end();
        }
    },
    {
        path: '301-without-location-header',
        description: "Moved Permanently",
        cb: (req, res) => {
            res.status(301).end();
        }
    },
    {
        path: '302-with-location-header',
        cb: (req, res) => {
            res.status(302).location('/plain.html').end();
        }
    },
    {
        path: '302-without-location-header',
        description: "Moved Permanently",
        description: "Found",
        cb: (req, res) => {
            res.status(302).end();
        }
    },
    {
        path: '303-with-location-header',
        description: "See Other",
        cb: (req, res) => {
            res.status(303).location('/plain.html').end();
        }
    },
    {
        path: '303-without-location-header',
        description: "See Other",
        cb: (req, res) => {
            res.status(303).end();
        }
    },
    // {path: '304',
    //     description: "Not Modified"
    // },
    {
        path: '305',
        description: "Use Proxy"
    },
    // {path: '306',
    //     description: "Unused"
    // }, 
    {
        path: '307-with-location-header',
        description: "Temporary Redirect",
        cb: (req, res) => {
            res.status(307).location('/plain.html').end();
        }

    },
    {
        path: '307-without-location-header',
        description: "Temporary Redirect",
        cb: (req, res) => {
            res.status(307).end();
        }
    },
    {
        path: '308-with-location-header',
        description: "Permanent Redirect",
        cb: (req, res) => {
            res.status(308).location('/plain.html').end();
        }
    },
    {
        path: '308-without-location-header',
        description: "Permanent Redirect",
        cb: (req, res) => {
            res.status(308).end();
        }
    },
    {
        path: '400',
        description: "Bad Request"
    },
    {
        path: '401',
        description: "Unauthorized"
    },
    {
        path: '402',
        description: "Payment Required"
    },
    {
        path: '403',
        description: "Forbidden"
    },
    {
        path: '404',
        description: "Not Found"
    },
    {
        path: '405',
        description: "Method Not Allowed"
    },
    {
        path: '406',
        description: "Not Acceptable"
    },
    {
        path: '407',
        description: "Proxy Authentication Required"
    },
    {
        path: '408',
        description: "Request Timeout"
    },
    {
        path: '409',
        description: "Conflict"
    },
    {
        path: '410',
        description: "Gone"
    },
    {
        path: '411',
        description: "Length Required"
    },
    {
        path: '412',
        description: "Precondition Failed"
    },
    {
        path: '413',
        description: "Request Entity Too Large"
    },
    {
        path: '414',
        description: "Request-URI Too Long"
    },
    {
        path: '415',
        description: "Unsupported Media Type"
    },
    {
        path: '416',
        description: "Requested Range Not Satisfiable"
    },
    {
        path: '417',
        description: "Expectation Failed"
    },
    {
        path: '418',
        description: "I'm a teapot"
    },
    {
        path: '421',
        description: "Misdirected Request"
    },
    {
        path: '422',
        description: "Unprocessable Entity"
    },
    {
        path: '428',
        description: "Precondition Required"
    },
    {
        path: '429',
        description: "Too Many Requests"
    },
    {
        path: '431',
        description: "Request Header Fields Too Large"
    },
    {
        path: '451',
        description: "Unavailable For Legal Reasons"
    },
    {
        path: '500',
        description: "Internal Server Error"
    },
    {
        path: '501',
        description: "Not Implemented"
    },
    {
        path: '502',
        description: "Bad Gateway"
    },
    {
        path: '503',
        description: "Service Unavailable"
    },
    {
        path: '504',
        description: "Gateway Timeout"
    },
    {
        path: '505',
        description: "HTTP Version Not Supported"
    },
    {
        path: '511',
        description: "Network Authentication Required"
    },
    {
        path: '520',
        description: "Web server is returning an unknown error"
    },
    {
        path: '522',
        description: "Connection timed out"
    },
    {
        path: '524',
        description: "A timeout occurred"
    },
    {
        path: 'plain.html',
        private: true,
        cb: (req, res) => {
            res.send(ok())
        }
    }
];