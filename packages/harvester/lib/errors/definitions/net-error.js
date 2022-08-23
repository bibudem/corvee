import * as chromiumNetErrors from 'chromium-net-errors'
import paramCase from 'param-case'

import { ERROR_PROPS, BaseError } from '.'

export const NET_ERROR_DEF = {
    name: 'NET_ERROR',
    prefix: 'net',
    props: Object.assign({}, ERROR_PROPS, {
        // name: 'name',
        // message: 'message',
        // code: 'errno',
        name: 'code',
        type: 'type'
    }),
    test: function (err) {
        return err instanceof NetError;
    }
};

export class NetError extends BaseError {
    constructor(description, message) {

        if (/net::ERR_([^ ]+)/i.test(description)) {
            description = /(?:net::ERR_)([^ ]+)/i.exec(description)[1];
        }

        const ChromiumNetError = chromiumNetErrors.getErrorByDescription(description)
        const chromiumNetError = new ChromiumNetError(message)

        super(chromiumNetError.message)

        this.code = paramCase(`net-${chromiumNetError.description ? chromiumNetError.description : chromiumNetError.name}`)

        if (chromiumNetError.type) {
            this.type = chromiumNetError.type

            if (this.type === 'connection') {

                // net-address-in-use
                // net-address-invalid
                // net-address-unreachable
                // net-alpn-negotiation-failed
                // net-bad-ssl-client-auth-cert
                // net-client-auth-cert-type-unsupported
                // net-connection-timed-out
                // net-internet-disconnected
                // net-cert-error-in-ssl-renogotiation
                // net-connection-aborted
                // net-connection-closed
                // net-connection-failed
                // net-connection-refused
                // net-connection-reset
                // net-connection-reset
                // net-connection-timed-out
                // net-ct-consistency-proof-parsing-failed
                // net-ct-sth-incomplete
                // net-ct-sth-parsing-failed
                // net-early-data-rejected
                // net-ech-fallback-certificate-invalid
                // net-ech-not-negotiated
                // net-host-resolver-queue-too-large
                // net-https-proxy-tunnel-response-redirect
                // net-icann-name-collision
                // net-invalid-ech-config-list
                // net-mandatory-proxy-configuration-failed
                // net-msg-too-big
                // net-name-not-resolved
                // net-name-resolution-failed
                // net-network-access-denied
                // net-no-buffer-space
                // net-no-ssl-versions-enabled
                // net-preconnect-max-socket-limit
                // net-procy-auth-requested
                // net-proxy-auth-unsupported
                // net-proxy-certificate-invalid
                // net-proxy-connection-failed
                // net-read-if-ready-not-implemented
                // net-socket-receive-buffer-size-unchangeable
                // net-socket-send-buffer-size-unchangeable
                // net-socket-set-receive-buffer-size-error
                // net-socket-set-send-buffer-size-error
                // net-socks-connection-failed
                // net-socks-connection-host-unreachable
                // net-ssl-bad-peer-public-key
                // net-ssl-bad-record-mac-alert
                // net-ssl-client-auth-cert-bad-format
                // net-ssl-client-auth-cert-needed
                // net-ssl-client-auth-cert-no-private-key
                // net-ssl-client-auth-no-common-algorithms
                // net-ssl-client-auth-provate-key-access-denied
                // net-ssl-client-auth-signature-failed
                // net-ssl-decompression-failure-alert
                // net-ssl-decrypt-error-alert
                // net-ssl-handshake-not-completed
                // net-ssl-key-usage-incompatible
                // net-ssl-no-renegotiation
                // net-ssl-obsolete-cipher
                // net-ssl-pinned-key-not-in-cert-chain
                // net-ssl-protocol-error
                // net-ssl-renegotiation-requested
                // net-ssl-server-cert-bad-format
                // net-ssl-server-cert-changed
                // net-ssl-unrecognized-name-alert
                // net-ssl-version-or-cipher-mismatch
                // net-temporarily-throttled
                // net-tls13-downgrade-detected
                // net-tunnel-connection-failed
                // net-unable-to-reuse-connection-for-proxy-auth
                // net-winsock-unexpected-written-bytes
                // net-wrong-version-on-early-data
                // net-ws-throttle-queue-too-large
                // net-ws-protocol-error
                // net-ws-upgrade

                this.level = 'error'
            }

            if (this.type === 'connection') {

                // net-cert-authority-invalid
                // net-cert-common-name-invalid
                // net-cert-contains-errors
                // net-cert-data-invalid
                // net-cert-end
                // net-cert-invalid
                // net-cert-known-interception-blocked
                // net-cert-name-constraint-violation
                // net-cert-no-revocation-mechanism
                // net-cert-non-unique-name
                // net-cert-revoked
                // net-cert-symantec-legacy
                // net-cert-unable-to-check-revocation
                // net-cert-validity-too-long
                // net-cert-weak-key
                // net-cert-weak-signautre-algorithm
                // net-certificate-tranparency-required
                // net-ssl-obsolete-version

                this.level = 'error'
            }

            if (this.type === 'http') {

                // net-content-decoding-failed
                // net-content-decoding-init-failed
                // net-content-length-mismatch
                // net-disallowed-url-scheme
                // net-empty-response
                // net-encoding-conversion-failed
                // net-encoding-detection-failed
                // net-http-1-1-required
                // net-http-response-code-failure
                // net-http2-claimed-pushed-stream-reset-by-server
                // net-http2-client-refused-stream
                // net-http2-compression-error
                // net-http2-flow-control-error
                // net-http2-frame-size-error
                // net-http2-inadequate-transport-security
                // net-http2-ping-failed
                // net-http2-protocol-error
                // net-http2-pushed-response-does-not-match
                // net-http2-pushed-stream-not-available
                // net-http2-rst-stream-no-error-recieved
                // net-http2-server-refused-stream
                // net-http2-stream-closed
                // net-incomplete-chunked-encoding
                // net-incomplete-http2-headers
                // net-invalid-auth-credentials
                // net-invalid-chunked-encoding
                // net-invalid-http-response
                // net-invalid-redirect
                // net-invalid-response
                // net-invalid-url
                // net-malformed-identity
                // net-method-not-supported
                // net-misconfigured-auth-environment
                // net-missing-auth-credentials
                // net-network-io-suspended
                // net-not-supported-proxies
                // net-pac-not-in-dhcp
                // net-pac-script-failed
                // net-pac-script-terminated
                // net-proxy-auth-requested-with-no-connection
                // net-proxy-http-1-1-required
                // net-quic-cert-root-not-known
                // net-quic-goaway-request-can-be-retired
                // net-quic-handshake-failed
                // net-quic-protocol-error
                // net-request-range-not-satisfiable
                // net-response-body-too-big-to-drain
                // net-response-headers-multiple-content-disposition
                // net-response-headers-multiple-content-length
                // net-response-headers-multiple-location
                // net-response-headers-too-big
                // net-response-headers-truncated
                // net-syn-reply-not-received
                // net-too-many-redirects
                // net-too-many-retries
                // net-undocumented-secutiry-library-status
                // net-unexpected-secutiry-library-status
                // net-unknown-proxy-auth
                // net-unknown-usl-scheme
                // net-unrecognized-ftp-directory-listing-format
                // net-unsafe-port
                // net-unsafe-redirect
                // net-unsupported-auth-scheme


                this.level = 'error'
            }
        }
    }
}

//
//
//

if (require.main === module) {
    const e = new NetError('net::ERR_IO_PENDING')
    console.log(JSON.stringify(e, null, 2))
    // console.log(`${e.stack}`)
}