function ok(msg) {
    return msg ? msg : 'ok';
}

export default [{
        path: 'a',
        description: "a"
    },
    {
        path: 'b',
        description: "b"
    },
    {
        path: 'common-page.html',
        home: true,
        cb: (req, res) => {
            res.send(ok())
        }
    },
    {
        path: 'c',
        description: "c"
    },
    {
        path: 'd',
        description: "d"
    },
    {
        path: 'e',
        description: "e",
    }
];