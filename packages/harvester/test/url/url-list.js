export default [{
        "url": "http://foo.com/blah_blah",
        "valid": true
    },
    {
        "url": "http://foo.com/blah_blah/",
        "valid": true
    },
    {
        "url": "http://foo.com/blah_blah_(wikipedia)",
        "valid": true
    },
    {
        "url": "http://foo.com/blah_blah_(wikipedia)_(again)",
        "valid": true
    },
    {
        "url": "http://www.example.com/wpstyle/?p=364",
        "valid": true
    },
    {
        "url": "https://www.example.com/foo/?bar=baz&inga=42&quux",
        "valid": true
    },
    {
        "url": "http://✪df.ws/123",
        "valid": true
    },
    {
        "url": "http://userid:password@example.com:8080",
        "valid": true
    },
    {
        "url": "http://userid:password@example.com:8080/",
        "valid": true
    },
    {
        "url": "http://userid@example.com",
        "valid": true
    },
    {
        "url": "http://userid@example.com/",
        "valid": true
    },
    {
        "url": "http://userid@example.com:8080",
        "valid": true
    },
    {
        "url": "http://userid@example.com:8080/",
        "valid": true
    },
    {
        "url": "http://userid:password@example.com",
        "valid": true
    },
    {
        "url": "http://userid:password@example.com/",
        "valid": true
    },
    {
        "url": "http://142.42.1.1/",
        "valid": true
    },
    {
        "url": "http://142.42.1.1:8080/",
        "valid": true
    },
    {
        "url": "http://➡.ws/䨹",
        "valid": true
    },
    {
        "url": "http://⌘.ws",
        "valid": true
    },
    {
        "url": "http://⌘.ws/",
        "valid": true
    },
    {
        "url": "http://foo.com/blah_(wikipedia)#cite-1",
        "valid": true
    },
    {
        "url": "http://foo.com/blah_(wikipedia)_blah#cite-1",
        "valid": true
    },
    {
        "url": "http://foo.com/unicode_(✪)_in_parens",
        "valid": true
    },
    {
        "url": "http://foo.com/(something)?after=parens",
        "valid": true
    },
    {
        "url": "http://☺.damowmow.com/",
        "valid": true
    },
    {
        "url": "http://code.google.com/events/#&product=browser",
        "valid": true
    },
    {
        "url": "http://j.mp",
        "valid": true
    },
    {
        "url": "ftp://foo.bar/baz",
        "valid": true
    },
    {
        "url": "http://foo.bar/?q=Test%20URL-encoded%20stuff",
        "valid": true
    },
    {
        "url": "http://مثال.إختبار",
        "valid": true
    },
    {
        "url": "http://例子.测试",
        "valid": true
    },
    {
        "url": "http://उदाहरण.परीक्षा",
        "valid": true
    },
    {
        "url": "http://-.~_!$&()*+,;=:%40:80%2f::::::@example.com",
        "valid": true
    },
    {
        "url": "http://1337.net",
        "valid": true
    },
    {
        "url": "http://a.b-c.de",
        "valid": true
    },
    {
        "url": "http://223.255.255.254",
        "valid": true
    },
    {
        "url": "http://",
        "valid": false
    },
    {
        "url": "http://.",
        "valid": false
    },
    {
        "url": "http://..",
        "valid": false
    },
    {
        "url": "http://../",
        "valid": false
    },
    {
        "url": "http://?",
        "valid": false
    },
    {
        "url": "http://??",
        "valid": false
    },
    {
        "url": "http://??/",
        "valid": false
    },
    {
        "url": "http://#",
        "valid": false
    },
    {
        "url": "http://##",
        "valid": false
    },
    {
        "url": "http://##/",
        "valid": false
    },
    // {
    //     "url": "http://foo.bar?q=Spaces should be encoded",
    //     "valid": false
    // },
    {
        "url": "//",
        "valid": false
    },
    {
        "url": "//a",
        "valid": false
    },
    {
        "url": "///a",
        "valid": false
    },
    {
        "url": "///",
        "valid": false
    },
    {
        "url": "http:///a",
        "valid": false
    },
    {
        "url": "foo.com",
        "valid": false
    },
    {
        "url": "rdar://1234",
        "valid": false
    },
    {
        "url": "h://test",
        "valid": false
    },
    {
        "url": "http:// shouldfail.com",
        "valid": false
    },
    {
        "url": ":// should fail",
        "valid": false
    },
    {
        "url": "http://foo.bar/foo(bar)baz quux",
        "valid": false
    },
    {
        "url": "ftps://foo.bar/",
        "valid": false
    },
    {
        "url": "http://-error-.invalid/",
        "valid": false
    },
    // {
    //     "url": "http://a.b--c.de/",
    //     "valid": false
    // },
    {
        "url": "http://-a.b.co",
        "valid": false
    },
    {
        "url": "http://a.b-.co",
        "valid": false
    },
    {
        "url": "http://0.0.0.0",
        "valid": false
    },
    {
        "url": "http://10.1.1.0",
        "valid": false
    },
    {
        "url": "http://10.1.1.255",
        "valid": false
    },
    {
        "url": "http://224.1.1.1",
        "valid": false
    },
    // {
    //     "url": "http://1.1.1.1.1",
    //     "valid": false
    // },
    {
        "url": "http://123.123.123",
        "valid": false
    },
    {
        "url": "http://3628126748",
        "valid": false
    },
    {
        "url": "http://.www.foo.bar/",
        "valid": false
    },
    {
        "url": "http://www.foo.bar./",
        "valid": false
    },
    {
        "url": "http://.www.foo.bar./",
        "valid": false
    },
    {
        "url": "http://10.1.1.1",
        "valid": false
    },
    {
        "url": "http://10.1.1.254",
        "valid": false
    }
]