export default [{
        "title": "Certificate",
        "links": [{
                "url": "https://expired.badssl.com/",
                "text": "expired",
                "should-be": "bad"
            },
            {
                "url": "https://wrong.host.badssl.com/",
                "text": "wrong.host",
                "should-be": "bad"
            },
            {
                "url": "https://self-signed.badssl.com/",
                "text": "self-signed",
                "should-be": "bad"
            },
            {
                "url": "https://untrusted-root.badssl.com/",
                "text": "untrusted-root",
                "should-be": "bad"
            },
            {
                "url": "https://revoked.badssl.com/",
                "text": "revoked",
                "should-be": "bad"
            },
            // {
            //     "url": "https://pinning-test.badssl.com/",
            //     "text": "pinning-test",
            //     "should-be": "bad"
            // },
            {
                "url": "https://no-common-name.badssl.com/",
                "text": "no-common-name",
                "should-be": "dubious"
            },
            {
                "url": "https://no-subject.badssl.com/",
                "text": "no-subject",
                "should-be": "dubious"
            },
            {
                "url": "https://incomplete-chain.badssl.com/",
                "text": "incomplete-chain",
                "should-be": "dubious"
            },
            {
                "url": "https://sha1-intermediate.badssl.com/",
                "text": "sha1-intermediate",
                "should-be": "bad"
            },
            {
                "url": "https://sha256.badssl.com/",
                "text": "sha256",
                "should-be": "good"
            },
            {
                "url": "https://sha384.badssl.com/",
                "text": "sha384",
                "should-be": "good"
            },
            {
                "url": "https://sha512.badssl.com/",
                "text": "sha512",
                "should-be": "good"
            },
            {
                "url": "https://1000-sans.badssl.com/",
                "text": "1000-sans",
                "should-be": "good"
            },
            {
                "url": "https://10000-sans.badssl.com/",
                "text": "10000-sans",
                "should-be": "good"
            },
            {
                "url": "https://ecc256.badssl.com/",
                "text": "ecc256",
                "should-be": "good"
            },
            {
                "url": "https://ecc384.badssl.com/",
                "text": "ecc384",
                "should-be": "good"
            },
            {
                "url": "https://rsa2048.badssl.com/",
                "text": "rsa2048",
                "should-be": "good"
            },
            {
                "url": "https://rsa4096.badssl.com/",
                "text": "rsa4096",
                "should-be": "good"
            },
            {
                "url": "https://rsa8192.badssl.com/",
                "text": "rsa8192",
                "should-be": "dubious"
            },
            {
                "url": "https://extended-validation.badssl.com/",
                "text": "extended-validation",
                "should-be": "good"
            }
        ]
    },
    {
        "title": "Client Certificate",
        "links": [{
                "url": "https://client.badssl.com/",
                "text": "client",
                "should-be": "good"
            },
            {
                "url": "https://client-cert-missing.badssl.com/",
                "text": "client-cert-missing",
                "should-be": "bad"
            }
        ]
    },
    {
        "title": "Mixed Content",
        "links": [{
                "url": "https://mixed-script.badssl.com/",
                "text": "mixed-script",
                "should-be": "bad"
            },
            {
                "url": "https://very.badssl.com/",
                "text": "very",
                "should-be": "bad"
            },
            {
                "url": "https://mixed.badssl.com/",
                "text": "mixed",
                "should-be": "dubious"
            },
            {
                "url": "https://mixed-favicon.badssl.com/",
                "text": "mixed-favicon",
                "should-be": "dubious"
            },
            {
                "url": "https://mixed-form.badssl.com/",
                "text": "mixed-form",
                "should-be": "dubious"
            }
        ]
    },
    {
        "title": "Cipher Suite",
        "links": [{
                "url": "https://cbc.badssl.com/",
                "text": "cbc",
                "should-be": "dubious"
            },
            {
                "url": "https://rc4-md5.badssl.com/",
                "text": "rc4-md5",
                "should-be": "bad"
            },
            {
                "url": "https://rc4.badssl.com/",
                "text": "rc4",
                "should-be": "bad"
            },
            {
                "url": "https://3des.badssl.com/",
                "text": "3des",
                "should-be": "bad"
            },
            {
                "url": "https://null.badssl.com/",
                "text": "null",
                "should-be": "bad"
            },
            {
                "url": "https://mozilla-old.badssl.com/",
                "text": "mozilla-old",
                "should-be": "bad"
            },
            {
                "url": "https://mozilla-intermediate.badssl.com/",
                "text": "mozilla-intermediate",
                "should-be": "dubious"
            },
            {
                "url": "https://mozilla-modern.badssl.com/",
                "text": "mozilla-modern",
                "should-be": "good"
            }
        ]
    },
    {
        "title": "Key Exchange",
        "links": [{
                "url": "https://dh480.badssl.com/",
                "text": "dh480",
                "should-be": "bad"
            },
            {
                "url": "https://dh512.badssl.com/",
                "text": "dh512",
                "should-be": "bad"
            },
            {
                "url": "https://dh1024.badssl.com/",
                "text": "dh1024",
                "should-be": "dubious"
            },
            {
                "url": "https://dh2048.badssl.com/",
                "text": "dh2048",
                "should-be": "good"
            },
            {
                "url": "https://dh-small-subgroup.badssl.com/",
                "text": "dh-small-subgroup",
                "should-be": "bad"
            },
            {
                "url": "https://dh-composite.badssl.com/",
                "text": "dh-composite",
                "should-be": "bad"
            },
            {
                "url": "https://static-rsa.badssl.com/",
                "text": "static-rsa",
                "should-be": "dubious"
            }
        ]
    },
    {
        "title": "Protocol",
        "links": [{
                "url": "https://tls-v1-0.badssl.com:1010/",
                "text": "tls-v1-0",
                "should-be": "dubious"
            },
            {
                "url": "https://tls-v1-1.badssl.com:1011/",
                "text": "tls-v1-1",
                "should-be": "dubious"
            },
            {
                "url": "https://tls-v1-2.badssl.com:1012/",
                "text": "tls-v1-2",
                "should-be": "good"
            }
        ]
    },
    {
        "links": [{
            "url": "https://invalid-expected-sct.badssl.com/",
            "text": "invalid-expected-sct",
            "should-be": "bad"
        }],
        "title": "Certificate Transparency"
    },
    {
        "title": "Upgrade",
        "links": [{
                "url": "https://hsts.badssl.com/",
                "text": "hsts",
                "should-be": "good"
            },
            {
                "url": "https://upgrade.badssl.com/",
                "text": "upgrade",
                "should-be": "good"
            },
            {
                "url": "https://preloaded-hsts.badssl.com/",
                "text": "preloaded-hsts",
                "should-be": "good"
            },
            {
                "url": "https://subdomain.preloaded-hsts.badssl.com/",
                "text": "subdomain.preloaded-hsts",
                "should-be": "bad"
            },
            {
                "url": "https://https-everywhere.badssl.com/",
                "text": "https-everywhere",
                "should-be": "good"
            }
        ]
    },
    {
        "title": "UI",
        "links": [{
                "url": "https://spoofed-favicon.badssl.com/",
                "text": "spoofed-favicon",
                "should-be": "dubious"
            },
            {
                "url": "https://long-extended-subdomain-name-containing-many-letters-and-dashes.badssl.com/",
                "text": "long-extended-subdomain-name-containing-many-letters-and-dashes",
                "should-be": "good"
            },
            {
                "url": "https://longextendedsubdomainnamewithoutdashesinordertotestwordwrapping.badssl.com/",
                "text": "longextendedsubdomainnamewithoutdashesinordertotestwordwrapping",
                "should-be": "good"
            }
        ]
    },
    {
        "title": "Known Bad",
        "links": [{
                "url": "https://superfish.badssl.com/",
                "text": "(Lenovo) Superfish",
                "should-be": "bad"
            },
            {
                "url": "https://edellroot.badssl.com/",
                "text": "(Dell) eDellRoot",
                "should-be": "bad"
            },
            {
                "url": "https://dsdtestprovider.badssl.com/",
                "text": "(Dell) DSD Test Provider",
                "should-be": "bad"
            },
            {
                "url": "https://preact-cli.badssl.com/",
                "text": "preact-cli",
                "should-be": "bad"
            },
            {
                "url": "https://webpack-dev-server.badssl.com/",
                "text": "webpack-dev-server",
                "should-be": "bad"
            }
        ]
    },
    {
        "title": "Chrome Tests",
        "links": [{
                "url": "https://captive-portal.badssl.com/",
                "text": "captive-portal",
                "should-be": "bad"
            },
            {
                "url": "https://mitm-software.badssl.com/",
                "text": "mitm-software",
                "should-be": "bad"
            }
        ]
    },
    {
        "title": "Defunct",
        "links": [{
                "url": "https://sha1-2016.badssl.com/",
                "text": "sha1-2016",
                "should-be": "dubious"
            },
            {
                "url": "https://sha1-2017.badssl.com/",
                "text": "sha1-2017",
                "should-be": "bad"
            }
        ]
    }
]