/*
 * Ranges:
 *     0- 99 System related errors
 *   100-199 Connection related errors
 *   200-299 Certificate errors
 *   300-399 HTTP errors
 *   400-499 Cache errors
 *   500-599 ?
 *   600-699 FTP errors
 *   700-799 Certificate manager errors
 *   800-899 DNS resolver errors
 * @see: @link{https://source.chromium.org/chromium/chromium/src/+/master:net/base/net_error_list.h}
 */

export default [{
    name: "IoPendingError",
    code: -1,
    description: "IO_PENDING",
    type: "system",
    message: "An asynchronous IO operation is not yet complete.  This usually does not\nindicate a fatal error.  Typically this error will be generated as a\nnotification to wait for some external notification that the IO operation\nfinally completed."
}, {
    name: "FailedError",
    code: -2,
    description: "FAILED",
    type: "system",
    message: "A generic failure occurred."
}, {
    name: "AbortedError",
    code: -3,
    description: "ABORTED",
    type: "system",
    message: "An operation was aborted (due to user action)."
}, {
    name: "InvalidArgumentError",
    code: -4,
    description: "INVALID_ARGUMENT",
    type: "system",
    message: "An argument to the function is incorrect."
}, {
    name: "InvalidHandleError",
    code: -5,
    description: "INVALID_HANDLE",
    type: "system",
    message: "The handle or file descriptor is invalid."
}, {
    name: "FileNotFoundError",
    code: -6,
    description: "FILE_NOT_FOUND",
    type: "system",
    message: "The file or directory cannot be found."
}, {
    name: "TimedOutError",
    code: -7,
    description: "TIMED_OUT",
    type: "system",
    message: "An operation timed out."
}, {
    name: "FileTooBigError",
    code: -8,
    description: "FILE_TOO_BIG",
    type: "system",
    message: "The file is too large."
}, {
    name: "UnexpectedError",
    code: -9,
    description: "UNEXPECTED",
    type: "system",
    message: "An unexpected error.  This may be caused by a programming mistake or an\ninvalid assumption."
}, {
    name: "AccessDeniedError",
    code: -10,
    description: "ACCESS_DENIED",
    type: "system",
    message: "Permission to access a resource, other than the network, was denied."
}, {
    name: "NotImplementedError",
    code: -11,
    description: "NOT_IMPLEMENTED",
    type: "system",
    message: "The operation failed because of unimplemented functionality."
}, {
    name: "InsufficientResourcesError",
    code: -12,
    description: "INSUFFICIENT_RESOURCES",
    type: "system",
    message: "There were not enough resources to complete the operation."
}, {
    name: "OutOfMemoryError",
    code: -13,
    description: "OUT_OF_MEMORY",
    type: "system",
    message: "Memory allocation failed."
}, {
    name: "UploadFileChangedError",
    code: -14,
    description: "UPLOAD_FILE_CHANGED",
    type: "system",
    message: "The file upload failed because the file's modification time was different\nfrom the expectation."
}, {
    name: "SocketNotConnectedError",
    code: -15,
    description: "SOCKET_NOT_CONNECTED",
    type: "system",
    message: "The socket is not connected."
}, {
    name: "FileExistsError",
    code: -16,
    description: "FILE_EXISTS",
    type: "system",
    message: "The file already exists."
}, {
    name: "FilePathTooLongError",
    code: -17,
    description: "FILE_PATH_TOO_LONG",
    type: "system",
    message: "The path or file name is too long."
}, {
    name: "FileNoSpaceError",
    code: -18,
    description: "FILE_NO_SPACE",
    type: "system",
    message: "Not enough room left on the disk."
}, {
    name: "FileVirusInfectedError",
    code: -19,
    description: "FILE_VIRUS_INFECTED",
    type: "system",
    message: "The file has a virus."
}, {
    name: "BlockedByClientError",
    code: -20,
    description: "BLOCKED_BY_CLIENT",
    type: "system",
    message: "The client chose to block the request."
}, {
    name: "NetworkChangedError",
    code: -21,
    description: "NETWORK_CHANGED",
    type: "system",
    message: "The network changed."
}, {
    name: "BlockedByAdministratorError",
    code: -22,
    description: "BLOCKED_BY_ADMINISTRATOR",
    type: "system",
    message: "The request was blocked by the URL blacklist configured by the domain\nadministrator."
}, {
    name: "SocketIsConnectedError",
    code: -23,
    description: "SOCKET_IS_CONNECTED",
    type: "system",
    message: "The socket is already connected."
}, {
    name: "BlockedEnrollmentCheckPendingError",
    code: -24,
    description: "BLOCKED_ENROLLMENT_CHECK_PENDING",
    type: "system",
    message: "The request was blocked because the forced reenrollment check is still\npending. This error can only occur on ChromeOS.\nThe error can be emitted by code in chrome/browser/policy/policy_helpers.cc."
}, {
    name: "UploadStreamRewindNotSupportedError",
    code: -25,
    description: "UPLOAD_STREAM_REWIND_NOT_SUPPORTED",
    type: "system",
    message: "The upload failed because the upload stream needed to be re-read, due to a\nretry or a redirect, but the upload stream doesn't support that operation."
}, {
    name: "ContextShutDownError",
    code: -26,
    description: "CONTEXT_SHUT_DOWN",
    type: "system",
    message: "The request failed because the URLRequestContext is shutting down, or has\nbeen shut down."
}, {
    name: "BlockedByResponseError",
    code: -27,
    description: "BLOCKED_BY_RESPONSE",
    type: "system",
    message: "The request failed because the response was delivered along with requirements\nwhich are not met ('X-Frame-Options' and 'Content-Security-Policy' ancestor\nchecks and 'Cross-Origin-Resource-Policy', for instance)."
}, {
    name: "BlockedByXssAuditorError",
    code: -28,
    description: "BLOCKED_BY_XSS_AUDITOR",
    type: "system",
    message: "The request failed after the response was received, based on client-side\nheuristics that point to the possiblility of a cross-site scripting attack."
}, {
    name: "CleartextNotPermittedError",
    code: -29,
    description: "CLEARTEXT_NOT_PERMITTED",
    type: "system",
    message: "The request was blocked by system policy disallowing some or all cleartext\nrequests. Used for NetworkSecurityPolicy on Android."
}, {
    name: "ConnectionClosedError",
    code: -100,
    description: "CONNECTION_CLOSED",
    type: "connection",
    message: "A connection was closed (corresponding to a TCP FIN)."
}, {
    name: "ConnectionResetError",
    code: -101,
    description: "CONNECTION_RESET",
    type: "connection",
    message: "A connection was reset (corresponding to a TCP RST)."
}, {
    name: "ConnectionRefusedError",
    code: -102,
    description: "CONNECTION_REFUSED",
    type: "connection",
    message: "A connection attempt was refused."
}, {
    name: "ConnectionAbortedError",
    code: -103,
    description: "CONNECTION_ABORTED",
    type: "connection",
    message: "A connection timed out as a result of not receiving an ACK for data sent.\nThis can include a FIN packet that did not get ACK'd."
}, {
    name: "ConnectionFailedError",
    code: -104,
    description: "CONNECTION_FAILED",
    type: "connection",
    message: "A connection attempt failed."
}, {
    name: "NameNotResolvedError",
    code: -105,
    description: "NAME_NOT_RESOLVED",
    type: "connection",
    message: "The host name could not be resolved."
}, {
    name: "InternetDisconnectedError",
    code: -106,
    description: "INTERNET_DISCONNECTED",
    type: "connection",
    message: "The Internet connection has been lost."
}, {
    name: "SslProtocolError",
    code: -107,
    description: "SSL_PROTOCOL_ERROR",
    type: "connection",
    message: "An SSL protocol error occurred."
}, {
    name: "AddressInvalidError",
    code: -108,
    description: "ADDRESS_INVALID",
    type: "connection",
    message: "The IP address or port number is invalid (e.g., cannot connect to the IP\naddress 0 or the port 0)."
}, {
    name: "AddressUnreachableError",
    code: -109,
    description: "ADDRESS_UNREACHABLE",
    type: "connection",
    message: "The IP address is unreachable.  This usually means that there is no route to\nthe specified host or network."
}, {
    name: "SslClientAuthCertNeededError",
    code: -110,
    description: "SSL_CLIENT_AUTH_CERT_NEEDED",
    type: "connection",
    message: "The server requested a client certificate for SSL client authentication."
}, {
    name: "TunnelConnectionFailedError",
    code: -111,
    description: "TUNNEL_CONNECTION_FAILED",
    type: "connection",
    message: "A tunnel connection through the proxy could not be established."
}, {
    name: "NoSslVersionsEnabledError",
    code: -112,
    description: "NO_SSL_VERSIONS_ENABLED",
    type: "connection",
    message: "No SSL protocol versions are enabled."
}, {
    name: "SslVersionOrCipherMismatchError",
    code: -113,
    description: "SSL_VERSION_OR_CIPHER_MISMATCH",
    type: "connection",
    message: "The client and server don't support a common SSL protocol version or\ncipher suite."
}, {
    name: "SslRenegotiationRequestedError",
    code: -114,
    description: "SSL_RENEGOTIATION_REQUESTED",
    type: "connection",
    message: "The server requested a renegotiation (rehandshake)."
}, {
    name: "ProxyAuthUnsupportedError",
    code: -115,
    description: "PROXY_AUTH_UNSUPPORTED",
    type: "connection",
    message: "The proxy requested authentication (for tunnel establishment) with an\nunsupported method."
}, {
    name: "CertErrorInSslRenegotiationError",
    code: -116,
    description: "CERT_ERROR_IN_SSL_RENEGOTIATION",
    type: "connection",
    message: "During SSL renegotiation (rehandshake), the server sent a certificate with\nan error.\n\nNote: this error is not in the -2xx range so that it won't be handled as a\ncertificate error."
}, {
    name: "BadSslClientAuthCertError",
    code: -117,
    description: "BAD_SSL_CLIENT_AUTH_CERT",
    type: "connection",
    message: "The SSL handshake failed because of a bad or missing client certificate."
}, {
    name: "ConnectionTimedOutError",
    code: -118,
    description: "CONNECTION_TIMED_OUT",
    type: "connection",
    message: "A connection attempt timed out."
}, {
    name: "HostResolverQueueTooLargeError",
    code: -119,
    description: "HOST_RESOLVER_QUEUE_TOO_LARGE",
    type: "connection",
    message: "There are too many pending DNS resolves, so a request in the queue was\naborted."
}, {
    name: "SocksConnectionFailedError",
    code: -120,
    description: "SOCKS_CONNECTION_FAILED",
    type: "connection",
    message: "Failed establishing a connection to the SOCKS proxy server for a target host."
}, {
    name: "SocksConnectionHostUnreachableError",
    code: -121,
    description: "SOCKS_CONNECTION_HOST_UNREACHABLE",
    type: "connection",
    message: "The SOCKS proxy server failed establishing connection to the target host\nbecause that host is unreachable."
}, {
    name: "AlpnNegotiationFailedError",
    code: -122,
    description: "ALPN_NEGOTIATION_FAILED",
    type: "connection",
    message: "The request to negotiate an alternate protocol failed."
}, {
    name: "SslNoRenegotiationError",
    code: -123,
    description: "SSL_NO_RENEGOTIATION",
    type: "connection",
    message: "The peer sent an SSL no_renegotiation alert message."
}, {
    name: "WinsockUnexpectedWrittenBytesError",
    code: -124,
    description: "WINSOCK_UNEXPECTED_WRITTEN_BYTES",
    type: "connection",
    message: "Winsock sometimes reports more data written than passed.  This is probably\ndue to a broken LSP."
}, {
    name: "SslDecompressionFailureAlertError",
    code: -125,
    description: "SSL_DECOMPRESSION_FAILURE_ALERT",
    type: "connection",
    message: "An SSL peer sent us a fatal decompression_failure alert. This typically\noccurs when a peer selects DEFLATE compression in the mistaken belief that\nit supports it."
}, {
    name: "SslBadRecordMacAlertError",
    code: -126,
    description: "SSL_BAD_RECORD_MAC_ALERT",
    type: "connection",
    message: "An SSL peer sent us a fatal bad_record_mac alert. This has been observed\nfrom servers with buggy DEFLATE support."
}, {
    name: "ProxyAuthRequestedError",
    code: -127,
    description: "PROXY_AUTH_REQUESTED",
    type: "connection",
    message: "The proxy requested authentication (for tunnel establishment)."
}, {
    name: "SslWeakServerEphemeralDhKeyError",
    code: -129,
    description: "SSL_WEAK_SERVER_EPHEMERAL_DH_KEY",
    type: "connection",
    message: "The SSL server attempted to use a weak ephemeral Diffie-Hellman key."
}, {
    name: "ProxyConnectionFailedError",
    code: -130,
    description: "PROXY_CONNECTION_FAILED",
    type: "connection",
    message: "Could not create a connection to the proxy server. An error occurred\neither in resolving its name, or in connecting a socket to it.\nNote that this does NOT include failures during the actual \"CONNECT\" method\nof an HTTP proxy."
}, {
    name: "MandatoryProxyConfigurationFailedError",
    code: -131,
    description: "MANDATORY_PROXY_CONFIGURATION_FAILED",
    type: "connection",
    message: "A mandatory proxy configuration could not be used. Currently this means\nthat a mandatory PAC script could not be fetched, parsed or executed."
}, {
    name: "PreconnectMaxSocketLimitError",
    code: -133,
    description: "PRECONNECT_MAX_SOCKET_LIMIT",
    type: "connection",
    message: "We've hit the max socket limit for the socket pool while preconnecting.  We\ndon't bother trying to preconnect more sockets."
}, {
    name: "SslClientAuthPrivateKeyAccessDeniedError",
    code: -134,
    description: "SSL_CLIENT_AUTH_PRIVATE_KEY_ACCESS_DENIED",
    type: "connection",
    message: "The permission to use the SSL client certificate's private key was denied."
}, {
    name: "SslClientAuthCertNoPrivateKeyError",
    code: -135,
    description: "SSL_CLIENT_AUTH_CERT_NO_PRIVATE_KEY",
    type: "connection",
    message: "The SSL client certificate has no private key."
}, {
    name: "ProxyCertificateInvalidError",
    code: -136,
    description: "PROXY_CERTIFICATE_INVALID",
    type: "connection",
    message: "The certificate presented by the HTTPS Proxy was invalid."
}, {
    name: "NameResolutionFailedError",
    code: -137,
    description: "NAME_RESOLUTION_FAILED",
    type: "connection",
    message: "An error occurred when trying to do a name resolution (DNS)."
}, {
    name: "NetworkAccessDeniedError",
    code: -138,
    description: "NETWORK_ACCESS_DENIED",
    type: "connection",
    message: "Permission to access the network was denied. This is used to distinguish\nerrors that were most likely caused by a firewall from other access denied\nerrors. See also ERR_ACCESS_DENIED."
}, {
    name: "TemporarilyThrottledError",
    code: -139,
    description: "TEMPORARILY_THROTTLED",
    type: "connection",
    message: "The request throttler module cancelled this request to avoid DDOS."
}, {
    name: "HttpsProxyTunnelResponseRedirectError",
    code: -140,
    description: "HTTPS_PROXY_TUNNEL_RESPONSE_REDIRECT",
    type: "connection",
    message: "A request to create an SSL tunnel connection through the HTTPS proxy\nreceived a 302 (temporary redirect) response.  The response body might\ninclude a description of why the request failed.\n\nTODO(https://crbug.com/928551): This is deprecated and should not be used by\nnew code."
}, {
    name: "SslClientAuthSignatureFailedError",
    code: -141,
    description: "SSL_CLIENT_AUTH_SIGNATURE_FAILED",
    type: "connection",
    message: "We were unable to sign the CertificateVerify data of an SSL client auth\nhandshake with the client certificate's private key.\n\nPossible causes for this include the user implicitly or explicitly\ndenying access to the private key, the private key may not be valid for\nsigning, the key may be relying on a cached handle which is no longer\nvalid, or the CSP won't allow arbitrary data to be signed."
}, {
    name: "MsgTooBigError",
    code: -142,
    description: "MSG_TOO_BIG",
    type: "connection",
    message: "The message was too large for the transport.  (for example a UDP message\nwhich exceeds size threshold)."
}, {
    name: "WsProtocolError",
    code: -145,
    description: "WS_PROTOCOL_ERROR",
    type: "connection",
    message: "Websocket protocol error. Indicates that we are terminating the connection\ndue to a malformed frame or other protocol violation."
}, {
    name: "AddressInUseError",
    code: -147,
    description: "ADDRESS_IN_USE",
    type: "connection",
    message: "Returned when attempting to bind an address that is already in use."
}, {
    name: "SslHandshakeNotCompletedError",
    code: -148,
    description: "SSL_HANDSHAKE_NOT_COMPLETED",
    type: "connection",
    message: "An operation failed because the SSL handshake has not completed."
}, {
    name: "SslBadPeerPublicKeyError",
    code: -149,
    description: "SSL_BAD_PEER_PUBLIC_KEY",
    type: "connection",
    message: "SSL peer's public key is invalid."
}, {
    name: "SslPinnedKeyNotInCertChainError",
    code: -150,
    description: "SSL_PINNED_KEY_NOT_IN_CERT_CHAIN",
    type: "connection",
    message: "The certificate didn't match the built-in public key pins for the host name.\nThe pins are set in net/http/transport_security_state.cc and require that\none of a set of public keys exist on the path from the leaf to the root."
}, {
    name: "ClientAuthCertTypeUnsupportedError",
    code: -151,
    description: "CLIENT_AUTH_CERT_TYPE_UNSUPPORTED",
    type: "connection",
    message: "Server request for client certificate did not contain any types we support."
}, {
    name: "OriginBoundCertGenerationTypeMismatchError",
    code: -152,
    description: "ORIGIN_BOUND_CERT_GENERATION_TYPE_MISMATCH",
    type: "connection",
    message: "Server requested one type of cert, then requested a different type while the\nfirst was still being generated."
}, {
    name: "SslDecryptErrorAlertError",
    code: -153,
    description: "SSL_DECRYPT_ERROR_ALERT",
    type: "connection",
    message: "An SSL peer sent us a fatal decrypt_error alert. This typically occurs when\na peer could not correctly verify a signature (in CertificateVerify or\nServerKeyExchange) or validate a Finished message."
}, {
    name: "WsThrottleQueueTooLargeError",
    code: -154,
    description: "WS_THROTTLE_QUEUE_TOO_LARGE",
    type: "connection",
    message: "There are too many pending WebSocketJob instances, so the new job was not\npushed to the queue."
}, {
    name: "SslServerCertChangedError",
    code: -156,
    description: "SSL_SERVER_CERT_CHANGED",
    type: "connection",
    message: "The SSL server certificate changed in a renegotiation."
}, {
    name: "SslUnrecognizedNameAlertError",
    code: -159,
    description: "SSL_UNRECOGNIZED_NAME_ALERT",
    type: "connection",
    message: "The SSL server sent us a fatal unrecognized_name alert."
}, {
    name: "SocketSetReceiveBufferSizeError",
    code: -160,
    description: "SOCKET_SET_RECEIVE_BUFFER_SIZE_ERROR",
    type: "connection",
    message: "Failed to set the socket's receive buffer size as requested."
}, {
    name: "SocketSetSendBufferSizeError",
    code: -161,
    description: "SOCKET_SET_SEND_BUFFER_SIZE_ERROR",
    type: "connection",
    message: "Failed to set the socket's send buffer size as requested."
}, {
    name: "SocketReceiveBufferSizeUnchangeableError",
    code: -162,
    description: "SOCKET_RECEIVE_BUFFER_SIZE_UNCHANGEABLE",
    type: "connection",
    message: "Failed to set the socket's receive buffer size as requested, despite success\nreturn code from setsockopt."
}, {
    name: "SocketSendBufferSizeUnchangeableError",
    code: -163,
    description: "SOCKET_SEND_BUFFER_SIZE_UNCHANGEABLE",
    type: "connection",
    message: "Failed to set the socket's send buffer size as requested, despite success\nreturn code from setsockopt."
}, {
    name: "SslClientAuthCertBadFormatError",
    code: -164,
    description: "SSL_CLIENT_AUTH_CERT_BAD_FORMAT",
    type: "connection",
    message: "Failed to import a client certificate from the platform store into the SSL\nlibrary."
}, {
    name: "IcannNameCollisionError",
    code: -166,
    description: "ICANN_NAME_COLLISION",
    type: "connection",
    message: "Resolving a hostname to an IP address list included the IPv4 address\n\"127.0.53.53\". This is a special IP address which ICANN has recommended to\nindicate there was a name collision, and alert admins to a potential\nproblem."
}, {
    name: "SslServerCertBadFormatError",
    code: -167,
    description: "SSL_SERVER_CERT_BAD_FORMAT",
    type: "connection",
    message: "The SSL server presented a certificate which could not be decoded. This is\nnot a certificate error code as no X509Certificate object is available. This\nerror is fatal."
}, {
    name: "CtSthParsingFailedError",
    code: -168,
    description: "CT_STH_PARSING_FAILED",
    type: "connection",
    message: "Certificate Transparency: Received a signed tree head that failed to parse."
}, {
    name: "CtSthIncompleteError",
    code: -169,
    description: "CT_STH_INCOMPLETE",
    type: "connection",
    message: "Certificate Transparency: Received a signed tree head whose JSON parsing was\nOK but was missing some of the fields."
}, {
    name: "UnableToReuseConnectionForProxyAuthError",
    code: -170,
    description: "UNABLE_TO_REUSE_CONNECTION_FOR_PROXY_AUTH",
    type: "connection",
    message: "The attempt to reuse a connection to send proxy auth credentials failed\nbefore the AuthController was used to generate credentials. The caller should\nreuse the controller with a new connection. This error is only used\ninternally by the network stack."
}, {
    name: "CtConsistencyProofParsingFailedError",
    code: -171,
    description: "CT_CONSISTENCY_PROOF_PARSING_FAILED",
    type: "connection",
    message: "Certificate Transparency: Failed to parse the received consistency proof."
}, {
    name: "SslObsoleteCipherError",
    code: -172,
    description: "SSL_OBSOLETE_CIPHER",
    type: "connection",
    message: "The SSL server required an unsupported cipher suite that has since been\nremoved. This error will temporarily be signaled on a fallback for one or two\nreleases immediately following a cipher suite's removal, after which the\nfallback will be removed."
}, {
    name: "WsUpgradeError",
    code: -173,
    description: "WS_UPGRADE",
    type: "connection",
    message: "When a WebSocket handshake is done successfully and the connection has been\nupgraded, the URLRequest is cancelled with this error code."
}, {
    name: "ReadIfReadyNotImplementedError",
    code: -174,
    description: "READ_IF_READY_NOT_IMPLEMENTED",
    type: "connection",
    message: "Socket ReadIfReady support is not implemented. This error should not be user\nvisible, because the normal Read() method is used as a fallback."
}, {
    name: "NoBufferSpaceError",
    code: -176,
    description: "NO_BUFFER_SPACE",
    type: "connection",
    message: "No socket buffer space is available."
}, {
    name: "SslClientAuthNoCommonAlgorithmsError",
    code: -177,
    description: "SSL_CLIENT_AUTH_NO_COMMON_ALGORITHMS",
    type: "connection",
    message: "There were no common signature algorithms between our client certificate\nprivate key and the server's preferences."
}, {
    name: "EarlyDataRejectedError",
    code: -178,
    description: "EARLY_DATA_REJECTED",
    type: "connection",
    message: "TLS 1.3 early data was rejected by the server. This will be received before\nany data is returned from the socket. The request should be retried with\nearly data disabled."
}, {
    name: "WrongVersionOnEarlyDataError",
    code: -179,
    description: "WRONG_VERSION_ON_EARLY_DATA",
    type: "connection",
    message: "TLS 1.3 early data was offered, but the server responded with TLS 1.2 or\nearlier. This is an internal error code to account for a\nbackwards-compatibility issue with early data and TLS 1.2. It will be\nreceived before any data is returned from the socket. The request should be\nretried with early data disabled.\n\nSee https://tools.ietf.org/html/rfc8446#appendix-D.3 for details."
}, {
    name: "Tls13DowngradeDetectedError",
    code: -180,
    description: "TLS13_DOWNGRADE_DETECTED",
    type: "connection",
    message: "TLS 1.3 was enabled, but a lower version was negotiated and the server\nreturned a value indicating it supported TLS 1.3. This is part of a security\ncheck in TLS 1.3, but it may also indicate the user is behind a buggy\nTLS-terminating proxy which implemented TLS 1.2 incorrectly. (See\nhttps://crbug.com/boringssl/226.)"
}, {
    name: "SslKeyUsageIncompatibleError",
    code: -181,
    description: "SSL_KEY_USAGE_INCOMPATIBLE",
    type: "connection",
    message: "The server's certificate has a keyUsage extension incompatible with the\nnegotiated TLS key exchange method."
}, {
    name: "CertCommonNameInvalidError",
    code: -200,
    description: "CERT_COMMON_NAME_INVALID",
    type: "certificate",
    message: "The server responded with a certificate whose common name did not match\nthe host name.  This could mean:\n\n1. An attacker has redirected our traffic to their server and is\npresenting a certificate for which they know the private key.\n\n2. The server is misconfigured and responding with the wrong cert.\n\n3. The user is on a wireless network and is being redirected to the\nnetwork's login page.\n\n4. The OS has used a DNS search suffix and the server doesn't have\na certificate for the abbreviated name in the address bar.\n"
}, {
    name: "CertDateInvalidError",
    code: -201,
    description: "CERT_DATE_INVALID",
    type: "certificate",
    message: "The server responded with a certificate that, by our clock, appears to\neither not yet be valid or to have expired.  This could mean:\n\n1. An attacker is presenting an old certificate for which they have\nmanaged to obtain the private key.\n\n2. The server is misconfigured and is not presenting a valid cert.\n\n3. Our clock is wrong.\n"
}, {
    name: "CertAuthorityInvalidError",
    code: -202,
    description: "CERT_AUTHORITY_INVALID",
    type: "certificate",
    message: "The server responded with a certificate that is signed by an authority\nwe don't trust.  The could mean:\n\n1. An attacker has substituted the real certificate for a cert that\ncontains their public key and is signed by their cousin.\n\n2. The server operator has a legitimate certificate from a CA we don't\nknow about, but should trust.\n\n3. The server is presenting a self-signed certificate, providing no\ndefense against active attackers (but foiling passive attackers).\n"
}, {
    name: "CertContainsErrorsError",
    code: -203,
    description: "CERT_CONTAINS_ERRORS",
    type: "certificate",
    message: "The server responded with a certificate that contains errors.\nThis error is not recoverable.\n\nMSDN describes this error as follows:\n\"The SSL certificate contains errors.\"\nNOTE: It's unclear how this differs from ERR_CERT_INVALID. For consistency,\nuse that code instead of this one from now on.\n"
}, {
    name: "CertNoRevocationMechanismError",
    code: -204,
    description: "CERT_NO_REVOCATION_MECHANISM",
    type: "certificate",
    message: "The certificate has no mechanism for determining if it is revoked.  In\neffect, this certificate cannot be revoked."
}, {
    name: "CertUnableToCheckRevocationError",
    code: -205,
    description: "CERT_UNABLE_TO_CHECK_REVOCATION",
    type: "certificate",
    message: "Revocation information for the security certificate for this site is not\navailable.  This could mean:\n\n1. An attacker has compromised the private key in the certificate and is\nblocking our attempt to find out that the cert was revoked.\n\n2. The certificate is unrevoked, but the revocation server is busy or\nunavailable.\n"
}, {
    name: "CertRevokedError",
    code: -206,
    description: "CERT_REVOKED",
    type: "certificate",
    message: "The server responded with a certificate has been revoked.\nWe have the capability to ignore this error, but it is probably not the\nthing to do."
}, {
    name: "CertInvalidError",
    code: -207,
    description: "CERT_INVALID",
    type: "certificate",
    message: "The server responded with a certificate that is invalid.\nThis error is not recoverable.\n\nMSDN describes this error as follows:\n\"The SSL certificate is invalid.\"\n"
}, {
    name: "CertWeakSignatureAlgorithmError",
    code: -208,
    description: "CERT_WEAK_SIGNATURE_ALGORITHM",
    type: "certificate",
    message: "The server responded with a certificate that is signed using a weak\nsignature algorithm."
}, {
    name: "CertNonUniqueNameError",
    code: -210,
    description: "CERT_NON_UNIQUE_NAME",
    type: "certificate",
    message: "The host name specified in the certificate is not unique."
}, {
    name: "CertWeakKeyError",
    code: -211,
    description: "CERT_WEAK_KEY",
    type: "certificate",
    message: "The server responded with a certificate that contains a weak key (e.g.\na too-small RSA key)."
}, {
    name: "CertNameConstraintViolationError",
    code: -212,
    description: "CERT_NAME_CONSTRAINT_VIOLATION",
    type: "certificate",
    message: "The certificate claimed DNS names that are in violation of name constraints."
}, {
    name: "CertValidityTooLongError",
    code: -213,
    description: "CERT_VALIDITY_TOO_LONG",
    type: "certificate",
    message: "The certificate's validity period is too long."
}, {
    name: "CertificateTransparencyRequiredError",
    code: -214,
    description: "CERTIFICATE_TRANSPARENCY_REQUIRED",
    type: "certificate",
    message: "Certificate Transparency was required for this connection, but the server\ndid not provide CT information that complied with the policy."
}, {
    name: "CertSymantecLegacyError",
    code: -215,
    description: "CERT_SYMANTEC_LEGACY",
    type: "certificate",
    message: "The certificate chained to a legacy Symantec root that is no longer trusted.\nhttps://g.co/chrome/symantecpkicerts"
}, {
    name: "CertEndError",
    code: -216,
    description: "CERT_END",
    type: "certificate",
    message: "The value immediately past the last certificate error code."
}, {
    name: "InvalidUrlReport",
    code: -300,
    description: "INVALID_URL",
    type: "http",
    message: "The URL is invalid."
}, {
    name: "DisallowedUrlSchemeError",
    code: -301,
    description: "DISALLOWED_URL_SCHEME",
    type: "http",
    message: "The scheme of the URL is disallowed."
}, {
    name: "UnknownUrlSchemeError",
    code: -302,
    description: "UNKNOWN_URL_SCHEME",
    type: "http",
    message: "The scheme of the URL is unknown."
}, {
    name: "InvalidRedirectError",
    code: -303,
    description: "INVALID_REDIRECT",
    type: "http",
    message: "Attempting to load an URL resulted in a redirect to an invalid URL."
}, {
    name: "TooManyRedirectsError",
    code: -310,
    description: "TOO_MANY_REDIRECTS",
    type: "http",
    message: "Attempting to load an URL resulted in too many redirects."
}, {
    name: "UnsafeRedirectError",
    code: -311,
    description: "UNSAFE_REDIRECT",
    type: "http",
    message: "Attempting to load an URL resulted in an unsafe redirect (e.g., a redirect\nto file: * is considered unsafe)."
}, {
    name: "UnsafePortError",
    code: -312,
    description: "UNSAFE_PORT",
    type: "http",
    message: "Attempting to load an URL with an unsafe port number.  These are port\nnumbers that correspond to services, which are not robust to spurious input\nthat may be constructed as a result of an allowed web construct (e.g., HTTP\nlooks a lot like SMTP, so form submission to port 25 is denied)."
}, {
    name: "InvalidResponseError",
    code: -320,
    description: "INVALID_RESPONSE",
    type: "http",
    message: "The server's response was invalid."
}, {
    name: "InvalidChunkedEncodingError",
    code: -321,
    description: "INVALID_CHUNKED_ENCODING",
    type: "http",
    message: "Error in chunked transfer encoding."
}, {
    name: "MethodNotSupportedError",
    code: -322,
    description: "METHOD_NOT_SUPPORTED",
    type: "http",
    message: "The server did not support the request method."
}, {
    name: "UnexpectedProxyAuthError",
    code: -323,
    description: "UNEXPECTED_PROXY_AUTH",
    type: "http",
    message: "The response was 407 (Proxy Authentication Required), yet we did not send\nthe request to a proxy."
}, {
    name: "EmptyResponseError",
    code: -324,
    description: "EMPTY_RESPONSE",
    type: "http",
    message: "The server closed the connection without sending any data."
}, {
    name: "ResponseHeadersTooBigError",
    code: -325,
    description: "RESPONSE_HEADERS_TOO_BIG",
    type: "http",
    message: "The headers section of the response is too large."
}, {
    name: "PacStatusNotOkError",
    code: -326,
    description: "PAC_STATUS_NOT_OK",
    type: "http",
    message: "The PAC requested by HTTP did not have a valid status code (non-200)."
}, {
    name: "PacScriptFailedError",
    code: -327,
    description: "PAC_SCRIPT_FAILED",
    type: "http",
    message: "The evaluation of the PAC script failed."
}, {
    name: "RequestRangeNotSatisfiableError",
    code: -328,
    description: "REQUEST_RANGE_NOT_SATISFIABLE",
    type: "http",
    message: "The response was 416 (Requested range not satisfiable) and the server cannot\nsatisfy the range requested."
}, {
    name: "MalformedIdentityError",
    code: -329,
    description: "MALFORMED_IDENTITY",
    type: "http",
    message: "The identity used for authentication is invalid."
}, {
    name: "ContentDecodingFailedError",
    code: -330,
    description: "CONTENT_DECODING_FAILED",
    type: "http",
    message: "Content decoding of the response body failed."
}, {
    name: "NetworkIoSuspendedError",
    code: -331,
    description: "NETWORK_IO_SUSPENDED",
    type: "http",
    message: "An operation could not be completed because all network IO\nis suspended."
}, {
    name: "SynReplyNotReceivedError",
    code: -332,
    description: "SYN_REPLY_NOT_RECEIVED",
    type: "http",
    message: "FLIP data received without receiving a SYN_REPLY on the stream."
}, {
    name: "EncodingConversionFailedError",
    code: -333,
    description: "ENCODING_CONVERSION_FAILED",
    type: "http",
    message: "Converting the response to target encoding failed."
}, {
    name: "UnrecognizedFtpDirectoryListingFormatError",
    code: -334,
    description: "UNRECOGNIZED_FTP_DIRECTORY_LISTING_FORMAT",
    type: "http",
    message: "The server sent an FTP directory listing in a format we do not understand."
}, {
    name: "NoSupportedProxiesError",
    code: -336,
    description: "NO_SUPPORTED_PROXIES",
    type: "http",
    message: "There are no supported proxies in the provided list."
}, {
    name: "SpdyProtocolError",
    code: -337,
    description: "SPDY_PROTOCOL_ERROR",
    type: "http",
    message: "There is a SPDY protocol error."
}, {
    name: "InvalidAuthCredentialsError",
    code: -338,
    description: "INVALID_AUTH_CREDENTIALS",
    type: "http",
    message: "Credentials could not be established during HTTP Authentication."
}, {
    name: "UnsupportedAuthSchemeError",
    code: -339,
    description: "UNSUPPORTED_AUTH_SCHEME",
    type: "http",
    message: "An HTTP Authentication scheme was tried which is not supported on this\nmachine."
}, {
    name: "EncodingDetectionFailedError",
    code: -340,
    description: "ENCODING_DETECTION_FAILED",
    type: "http",
    message: "Detecting the encoding of the response failed."
}, {
    name: "MissingAuthCredentialsError",
    code: -341,
    description: "MISSING_AUTH_CREDENTIALS",
    type: "http",
    message: "(GSSAPI) No Kerberos credentials were available during HTTP Authentication."
}, {
    name: "UnexpectedSecurityLibraryStatusError",
    code: -342,
    description: "UNEXPECTED_SECURITY_LIBRARY_STATUS",
    type: "http",
    message: "An unexpected, but documented, SSPI or GSSAPI status code was returned."
}, {
    name: "MisconfiguredAuthEnvironmentError",
    code: -343,
    description: "MISCONFIGURED_AUTH_ENVIRONMENT",
    type: "http",
    message: "The environment was not set up correctly for authentication (for\nexample, no KDC could be found or the principal is unknown."
}, {
    name: "UndocumentedSecurityLibraryStatusError",
    code: -344,
    description: "UNDOCUMENTED_SECURITY_LIBRARY_STATUS",
    type: "http",
    message: "An undocumented SSPI or GSSAPI status code was returned."
}, {
    name: "ResponseBodyTooBigToDrainError",
    code: -345,
    description: "RESPONSE_BODY_TOO_BIG_TO_DRAIN",
    type: "http",
    message: "The HTTP response was too big to drain."
}, {
    name: "ResponseHeadersMultipleContentLengthError",
    code: -346,
    description: "RESPONSE_HEADERS_MULTIPLE_CONTENT_LENGTH",
    type: "http",
    message: "The HTTP response contained multiple distinct Content-Length headers."
}, {
    name: "IncompleteSpdyHeadersError",
    code: -347,
    description: "INCOMPLETE_SPDY_HEADERS",
    type: "http",
    message: "SPDY Headers have been received, but not all of them - status or version\nheaders are missing, so we're expecting additional frames to complete them."
}, {
    name: "PacNotInDhcpError",
    code: -348,
    description: "PAC_NOT_IN_DHCP",
    type: "http",
    message: "No PAC URL configuration could be retrieved from DHCP. This can indicate\neither a failure to retrieve the DHCP configuration, or that there was no\nPAC URL configured in DHCP."
}, {
    name: "ResponseHeadersMultipleContentDispositionError",
    code: -349,
    description: "RESPONSE_HEADERS_MULTIPLE_CONTENT_DISPOSITION",
    type: "http",
    message: "The HTTP response contained multiple Content-Disposition headers."
}, {
    name: "ResponseHeadersMultipleLocationError",
    code: -350,
    description: "RESPONSE_HEADERS_MULTIPLE_LOCATION",
    type: "http",
    message: "The HTTP response contained multiple Location headers."
}, {
    name: "SpdyServerRefusedStreamError",
    code: -351,
    description: "SPDY_SERVER_REFUSED_STREAM",
    type: "http",
    message: "HTTP/2 server refused the request without processing, and sent either a\nGOAWAY frame with error code NO_ERROR and Last-Stream-ID lower than the\nstream id corresponding to the request indicating that this request has not\nbeen processed yet, or a RST_STREAM frame with error code REFUSED_STREAM.\nClient MAY retry (on a different connection).  See RFC7540 Section 8.1.4."
}, {
    name: "SpdyPingFailedError",
    code: -352,
    description: "SPDY_PING_FAILED",
    type: "http",
    message: "SPDY server didn't respond to the PING message."
}, {
    name: "ContentLengthMismatchError",
    code: -354,
    description: "CONTENT_LENGTH_MISMATCH",
    type: "http",
    message: "The HTTP response body transferred fewer bytes than were advertised by the\nContent-Length header when the connection is closed."
}, {
    name: "IncompleteChunkedEncodingError",
    code: -355,
    description: "INCOMPLETE_CHUNKED_ENCODING",
    type: "http",
    message: "The HTTP response body is transferred with Chunked-Encoding, but the\nterminating zero-length chunk was never sent when the connection is closed."
}, {
    name: "QuicProtocolError",
    code: -356,
    description: "QUIC_PROTOCOL_ERROR",
    type: "http",
    message: "There is a QUIC protocol error."
}, {
    name: "ResponseHeadersTruncatedError",
    code: -357,
    description: "RESPONSE_HEADERS_TRUNCATED",
    type: "http",
    message: "The HTTP headers were truncated by an EOF."
}, {
    name: "QuicHandshakeFailedError",
    code: -358,
    description: "QUIC_HANDSHAKE_FAILED",
    type: "http",
    message: "The QUIC crytpo handshake failed.  This means that the server was unable\nto read any requests sent, so they may be resent."
}, {
    name: "SpdyInadequateTransportSecurityError",
    code: -360,
    description: "SPDY_INADEQUATE_TRANSPORT_SECURITY",
    type: "http",
    message: "Transport security is inadequate for the SPDY version."
}, {
    name: "SpdyFlowControlError",
    code: -361,
    description: "SPDY_FLOW_CONTROL_ERROR",
    type: "http",
    message: "The peer violated SPDY flow control."
}, {
    name: "SpdyFrameSizeError",
    code: -362,
    description: "SPDY_FRAME_SIZE_ERROR",
    type: "http",
    message: "The peer sent an improperly sized SPDY frame."
}, {
    name: "SpdyCompressionError",
    code: -363,
    description: "SPDY_COMPRESSION_ERROR",
    type: "http",
    message: "Decoding or encoding of compressed SPDY headers failed."
}, {
    name: "ProxyAuthRequestedWithNoConnectionError",
    code: -364,
    description: "PROXY_AUTH_REQUESTED_WITH_NO_CONNECTION",
    type: "http",
    message: "Proxy Auth Requested without a valid Client Socket Handle."
}, {
    name: "Http_1_1RequiredError",
    code: -365,
    description: "HTTP_1_1_REQUIRED",
    type: "http",
    message: "HTTP_1_1_REQUIRED error code received on HTTP/2 session."
}, {
    name: "ProxyHttp_1_1RequiredError",
    code: -366,
    description: "PROXY_HTTP_1_1_REQUIRED",
    type: "http",
    message: "HTTP_1_1_REQUIRED error code received on HTTP/2 session to proxy."
}, {
    name: "PacScriptTerminatedError",
    code: -367,
    description: "PAC_SCRIPT_TERMINATED",
    type: "http",
    message: "The PAC script terminated fatally and must be reloaded."
}, {
    name: "InvalidHttpResponseError",
    code: -370,
    description: "INVALID_HTTP_RESPONSE",
    type: "http",
    message: "The server was expected to return an HTTP/1.x response, but did not. Rather\nthan treat it as HTTP/0.9, this error is returned."
}, {
    name: "ContentDecodingInitFailedError",
    code: -371,
    description: "CONTENT_DECODING_INIT_FAILED",
    type: "http",
    message: "Initializing content decoding failed."
}, {
    name: "SpdyRstStreamNoErrorReceivedError",
    code: -372,
    description: "SPDY_RST_STREAM_NO_ERROR_RECEIVED",
    type: "http",
    message: "Received HTTP/2 RST_STREAM frame with NO_ERROR error code.  This error should\nbe handled internally by HTTP/2 code, and should not make it above the\nSpdyStream layer."
}, {
    name: "SpdyPushedStreamNotAvailableError",
    code: -373,
    description: "SPDY_PUSHED_STREAM_NOT_AVAILABLE",
    type: "http",
    message: "The pushed stream claimed by the request is no longer available."
}, {
    name: "SpdyClaimedPushedStreamResetByServerError",
    code: -374,
    description: "SPDY_CLAIMED_PUSHED_STREAM_RESET_BY_SERVER",
    type: "http",
    message: "A pushed stream was claimed and later reset by the server. When this happens,\nthe request should be retried."
}, {
    name: "TooManyRetriesError",
    code: -375,
    description: "TOO_MANY_RETRIES",
    type: "http",
    message: "An HTTP transaction was retried too many times due for authentication or\ninvalid certificates. This may be due to a bug in the net stack that would\notherwise infinite loop, or if the server or proxy continually requests fresh\ncredentials or presents a fresh invalid certificate."
}, {
    name: "SpdyStreamClosedError",
    code: -376,
    description: "SPDY_STREAM_CLOSED",
    type: "http",
    message: "Received an HTTP/2 frame on a closed stream."
}, {
    name: "SpdyClientRefusedStreamError",
    code: -377,
    description: "SPDY_CLIENT_REFUSED_STREAM",
    type: "http",
    message: "Client is refusing an HTTP/2 stream."
}, {
    name: "SpdyPushedResponseDoesNotMatchError",
    code: -378,
    description: "SPDY_PUSHED_RESPONSE_DOES_NOT_MATCH",
    type: "http",
    message: "A pushed HTTP/2 stream was claimed by a request based on matching URL and\nrequest headers, but the pushed response headers do not match the request."
}, {
    name: "CacheMissError",
    code: -400,
    description: "CACHE_MISS",
    type: "cache",
    message: "The cache does not have the requested entry."
}, {
    name: "CacheReadFailureError",
    code: -401,
    description: "CACHE_READ_FAILURE",
    type: "cache",
    message: "Unable to read from the disk cache."
}, {
    name: "CacheWriteFailureError",
    code: -402,
    description: "CACHE_WRITE_FAILURE",
    type: "cache",
    message: "Unable to write to the disk cache."
}, {
    name: "CacheOperationNotSupportedError",
    code: -403,
    description: "CACHE_OPERATION_NOT_SUPPORTED",
    type: "cache",
    message: "The operation is not supported for this entry."
}, {
    name: "CacheOpenFailureError",
    code: -404,
    description: "CACHE_OPEN_FAILURE",
    type: "cache",
    message: "The disk cache is unable to open this entry."
}, {
    name: "CacheCreateFailureError",
    code: -405,
    description: "CACHE_CREATE_FAILURE",
    type: "cache",
    message: "The disk cache is unable to create this entry."
}, {
    name: "CacheRaceError",
    code: -406,
    description: "CACHE_RACE",
    type: "cache",
    message: "Multiple transactions are racing to create disk cache entries. This is an\ninternal error returned from the HttpCache to the HttpCacheTransaction that\ntells the transaction to restart the entry-creation logic because the state\nof the cache has changed."
}, {
    name: "CacheChecksumReadFailureError",
    code: -407,
    description: "CACHE_CHECKSUM_READ_FAILURE",
    type: "cache",
    message: "The cache was unable to read a checksum record on an entry. This can be\nreturned from attempts to read from the cache. It is an internal error,\nreturned by the SimpleCache backend, but not by any URLRequest methods\nor members."
}, {
    name: "CacheChecksumMismatchError",
    code: -408,
    description: "CACHE_CHECKSUM_MISMATCH",
    type: "cache",
    message: "The cache found an entry with an invalid checksum. This can be returned from\nattempts to read from the cache. It is an internal error, returned by the\nSimpleCache backend, but not by any URLRequest methods or members."
}, {
    name: "CacheLockTimeoutError",
    code: -409,
    description: "CACHE_LOCK_TIMEOUT",
    type: "cache",
    message: "Internal error code for the HTTP cache. The cache lock timeout has fired."
}, {
    name: "CacheAuthFailureAfterReadError",
    code: -410,
    description: "CACHE_AUTH_FAILURE_AFTER_READ",
    type: "cache",
    message: "Received a challenge after the transaction has read some data, and the\ncredentials aren't available.  There isn't a way to get them at that point."
}, {
    name: "CacheEntryNotSuitableError",
    code: -411,
    description: "CACHE_ENTRY_NOT_SUITABLE",
    type: "cache",
    message: "Internal not-quite error code for the HTTP cache. In-memory hints suggest\nthat the cache entry would not have been useable with the transaction's\ncurrent configuration (e.g. load flags, mode, etc.)"
}, {
    name: "CacheDoomFailureError",
    code: -412,
    description: "CACHE_DOOM_FAILURE",
    type: "cache",
    message: "The disk cache is unable to doom this entry."
}, {
    name: "CacheOpenOrCreateFailureError",
    code: -413,
    description: "CACHE_OPEN_OR_CREATE_FAILURE",
    type: "cache",
    message: "The disk cache is unable to open or create this entry."
}, {
    name: "InsecureResponseError",
    code: -501,
    description: "INSECURE_RESPONSE",
    type: "unknown",
    message: "The server's response was insecure (e.g. there was a cert error)."
}, {
    name: "NoPrivateKeyForCertError",
    code: -502,
    description: "NO_PRIVATE_KEY_FOR_CERT",
    type: "unknown",
    message: "An attempt to import a client certificate failed, as the user's key\ndatabase lacked a corresponding private key."
}, {
    name: "AddUserCertFailedError",
    code: -503,
    description: "ADD_USER_CERT_FAILED",
    type: "unknown",
    message: "An error adding a certificate to the OS certificate database."
}, {
    name: "InvalidSignedExchangeError",
    code: -504,
    description: "INVALID_SIGNED_EXCHANGE",
    type: "unknown",
    message: "An error occurred while handling a signed exchange."
}, {
    name: "FtpFailedError",
    code: -601,
    description: "FTP_FAILED",
    type: "ftp",
    message: "A generic error for failed FTP control connection command.\nIf possible, please use or add a more specific error code."
}, {
    name: "FtpServiceUnavailableError",
    code: -602,
    description: "FTP_SERVICE_UNAVAILABLE",
    type: "ftp",
    message: "The server cannot fulfill the request at this point. This is a temporary\nerror.\nFTP response code 421."
}, {
    name: "FtpTransferAbortedError",
    code: -603,
    description: "FTP_TRANSFER_ABORTED",
    type: "ftp",
    message: "The server has aborted the transfer.\nFTP response code 426."
}, {
    name: "FtpFileBusyError",
    code: -604,
    description: "FTP_FILE_BUSY",
    type: "ftp",
    message: "The file is busy, or some other temporary error condition on opening\nthe file.\nFTP response code 450."
}, {
    name: "FtpSyntaxError",
    code: -605,
    description: "FTP_SYNTAX_ERROR",
    type: "ftp",
    message: "Server rejected our command because of syntax errors.\nFTP response codes 500, 501."
}, {
    name: "FtpCommandNotSupportedError",
    code: -606,
    description: "FTP_COMMAND_NOT_SUPPORTED",
    type: "ftp",
    message: "Server does not support the command we issued.\nFTP response codes 502, 504."
}, {
    name: "FtpBadCommandSequenceError",
    code: -607,
    description: "FTP_BAD_COMMAND_SEQUENCE",
    type: "ftp",
    message: "Server rejected our command because we didn't issue the commands in right\norder.\nFTP response code 503."
}, {
    name: "Pkcs12ImportBadPasswordError",
    code: -701,
    description: "PKCS12_IMPORT_BAD_PASSWORD",
    type: "certificate-manager",
    message: "PKCS #12 import failed due to incorrect password."
}, {
    name: "Pkcs12ImportFailedError",
    code: -702,
    description: "PKCS12_IMPORT_FAILED",
    type: "certificate-manager",
    message: "PKCS #12 import failed due to other error."
}, {
    name: "ImportCaCertNotCaError",
    code: -703,
    description: "IMPORT_CA_CERT_NOT_CA",
    type: "certificate-manager",
    message: "CA import failed - not a CA cert."
}, {
    name: "ImportCertAlreadyExistsError",
    code: -704,
    description: "IMPORT_CERT_ALREADY_EXISTS",
    type: "certificate-manager",
    message: "Import failed - certificate already exists in database.\nNote it's a little weird this is an error but reimporting a PKCS12 is ok\n(no-op).  That's how Mozilla does it, though."
}, {
    name: "ImportCaCertFailedError",
    code: -705,
    description: "IMPORT_CA_CERT_FAILED",
    type: "certificate-manager",
    message: "CA import failed due to some other error."
}, {
    name: "ImportServerCertFailedError",
    code: -706,
    description: "IMPORT_SERVER_CERT_FAILED",
    type: "certificate-manager",
    message: "Server certificate import failed due to some internal error."
}, {
    name: "Pkcs12ImportInvalidMacError",
    code: -707,
    description: "PKCS12_IMPORT_INVALID_MAC",
    type: "certificate-manager",
    message: "PKCS #12 import failed due to invalid MAC."
}, {
    name: "Pkcs12ImportInvalidFileError",
    code: -708,
    description: "PKCS12_IMPORT_INVALID_FILE",
    type: "certificate-manager",
    message: "PKCS #12 import failed due to invalid/corrupt file."
}, {
    name: "Pkcs12ImportUnsupportedError",
    code: -709,
    description: "PKCS12_IMPORT_UNSUPPORTED",
    type: "certificate-manager",
    message: "PKCS #12 import failed due to unsupported features."
}, {
    name: "KeyGenerationFailedError",
    code: -710,
    description: "KEY_GENERATION_FAILED",
    type: "certificate-manager",
    message: "Key generation failed."
}, {
    name: "PrivateKeyExportFailedError",
    code: -712,
    description: "PRIVATE_KEY_EXPORT_FAILED",
    type: "certificate-manager",
    message: "Failure to export private key."
}, {
    name: "SelfSignedCertGenerationFailedError",
    code: -713,
    description: "SELF_SIGNED_CERT_GENERATION_FAILED",
    type: "certificate-manager",
    message: "Self-signed certificate generation failed."
}, {
    name: "CertDatabaseChangedError",
    code: -714,
    description: "CERT_DATABASE_CHANGED",
    type: "certificate-manager",
    message: "The certificate database changed in some way."
}, {
    name: "DnsMalformedResponseError",
    code: -800,
    description: "DNS_MALFORMED_RESPONSE",
    type: "dns",
    message: "DNS resolver received a malformed response."
}, {
    name: "DnsServerRequiresTcpError",
    code: -801,
    description: "DNS_SERVER_REQUIRES_TCP",
    type: "dns",
    message: "DNS server requires TCP"
}, {
    name: "DnsServerFailedError",
    code: -802,
    description: "DNS_SERVER_FAILED",
    type: "dns",
    message: "DNS server failed.  This error is returned for all of the following\nerror conditions:\n1 - Format error - The name server was unable to interpret the query.\n2 - Server failure - The name server was unable to process this query\ndue to a problem with the name server.\n4 - Not Implemented - The name server does not support the requested\nkind of query.\n5 - Refused - The name server refuses to perform the specified\noperation for policy reasons."
}, {
    name: "DnsTimedOutError",
    code: -803,
    description: "DNS_TIMED_OUT",
    type: "dns",
    message: "DNS transaction timed out."
}, {
    name: "DnsCacheMissError",
    code: -804,
    description: "DNS_CACHE_MISS",
    type: "dns",
    message: "The entry was not found in cache, for cache-only lookups."
}, {
    name: "DnsSearchEmptyError",
    code: -805,
    description: "DNS_SEARCH_EMPTY",
    type: "dns",
    message: "Suffix search list rules prevent resolution of the given host name."
}, {
    name: "DnsSortError",
    code: -806,
    description: "DNS_SORT_ERROR",
    type: "dns",
    message: "Failed to sort addresses according to RFC3484."
}, {
    name: "DnsHttpFailedError",
    code: -807,
    description: "DNS_HTTP_FAILED",
    type: "dns",
    message: "Failed to resolve over HTTP, fallback to legacy"
}]