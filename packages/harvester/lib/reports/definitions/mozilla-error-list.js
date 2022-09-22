export default [

  /* common global codes (from nsError.h) */

  {
    description: "NS_ERROR_NOT_INITIALIZED",
    type: "system",
    message: "Component not initialized"
  },
  {
    description: "NS_ERROR_ALREADY_INITIALIZED",
    type: "system",
    message: "Component already initialized"
  },
  {
    description: "NS_ERROR_NOT_IMPLEMENTED",
    type: "system",
    message: "Method not implemented"
  },
  {
    description: "NS_NOINTERFACE",
    type: "system",
    message: "Component does not have requested interface"
  },
  {
    description: "NS_ERROR_NO_INTERFACE",
    type: "system",
    message: "Component does not have requested interface"
  },
  {
    description: "NS_ERROR_ILLEGAL_VALUE",
    type: "system",
    message: "Illegal value"
  },
  {
    description: "NS_ERROR_INVALID_POINTER",
    type: "system",
    message: "Invalid pointer"
  },
  {
    description: "NS_ERROR_NULL_POINTER",
    type: "system",
    message: "Null pointer"
  },
  {
    description: "NS_ERROR_ABORT",
    type: "system",
    message: "Abort"
  },
  {
    description: "NS_ERROR_FAILURE",
    type: "system",
    message: "Failure"
  },
  {
    description: "NS_ERROR_UNEXPECTED",
    type: "system",
    message: "Unexpected error"
  },
  {
    description: "NS_ERROR_OUT_OF_MEMORY",
    type: "system",
    message: "Out of Memory"
  },
  {
    description: "NS_ERROR_INVALID_ARG",
    type: "system",
    message: "Invalid argument"
  },
  {
    description: "NS_ERROR_NOT_AVAILABLE",
    type: "system",
    message: "Component is not available"
  },
  {
    description: "NS_ERROR_FACTORY_NOT_REGISTERED",
    type: "system",
    message: "Factory not registered"
  },
  {
    description: "NS_ERROR_FACTORY_REGISTER_AGAIN",
    type: "system",
    message: "Factory not registered (may be tried again)"
  },
  {
    description: "NS_ERROR_FACTORY_NOT_LOADED",
    type: "system",
    message: "Factory not loaded"
  },
  {
    description: "NS_ERROR_FACTORY_NO_SIGNATURE_SUPPORT",
    type: "system",
    message: "Factory does not support signatures"
  },
  {
    description: "NS_ERROR_FACTORY_EXISTS",
    type: "system",
    message: "Factory already exists"
  },
  {
    description: "NS_BASE_STREAM_CLOSED",
    type: "system",
    message: "Stream closed"
  },
  {
    description: "NS_BASE_STREAM_OSERROR",
    type: "system",
    message: "Error from the operating system"
  },
  {
    description: "NS_BASE_STREAM_ILLEGAL_ARGS",
    type: "system",
    message: "Illegal arguments"
  },
  {
    description: "NS_BASE_STREAM_NO_CONVERTER",
    type: "system",
    message: "No converter for unichar streams"
  },
  {
    description: "NS_BASE_STREAM_BAD_CONVERSION",
    type: "system",
    message: "Bad converter for unichar streams"
  },
  {
    description: "NS_BASE_STREAM_WOULD_BLOCK",
    type: "system",
    message: "Stream would block"
  },

  /* network related codes (from nsNetError.h) */

  {
    description: "NS_BINDING_FAILED",
    type: "connection",
    message: "The async request failed for some unknown reason"
  },
  {
    description: "NS_BINDING_ABORTED",
    type: "connection",
    message: "The async request failed because it was aborted by some user action"
  },
  {
    description: "NS_BINDING_REDIRECTED",
    type: "connection",
    message: "The async request has been redirected to a different async request"
  },
  {
    description: "NS_BINDING_RETARGETED",
    type: "connection",
    message: "The async request has been retargeted to a different handler"
  },
  {
    description: "NS_ERROR_MALFORMED_URI",
    type: "connection",
    message: "The URI is malformed"
  },
  {
    description: "NS_ERROR_UNKNOWN_PROTOCOL",
    type: "connection",
    message: "The URI scheme corresponds to an unknown protocol handler"
  },
  {
    description: "NS_ERROR_NO_CONTENT",
    type: "connection",
    message: "Channel opened successfully but no data will be returned"
  },
  {
    description: "NS_ERROR_IN_PROGRESS",
    type: "connection",
    message: "The requested action could not be completed while the object is busy"
  },
  {
    description: "NS_ERROR_ALREADY_OPENED",
    type: "connection",
    message: "Channel is already open"
  },
  {
    description: "NS_ERROR_INVALID_CONTENT_ENCODING",
    type: "connection",
    message: "The content encoding of the source document is incorrect"
  },
  {
    description: "NS_ERROR_CORRUPTED_CONTENT",
    type: "connection",
    message: "Corrupted content received from server (potentially MIME type mismatch because of 'X-Content-Type-Options: nosniff')"
  },
  {
    description: "NS_ERROR_FIRST_HEADER_FIELD_COMPONENT_EMPTY",
    message: "Couldn't extract first component from potentially corrupted header field"
  },
  {
    description: "NS_ERROR_ALREADY_CONNECTED",
    type: "connection",
    message: "The connection is already established"
  },
  {
    description: "NS_ERROR_NOT_CONNECTED",
    type: "connection",
    message: "The connection does not exist"
  },
  {
    description: "NS_ERROR_CONNECTION_REFUSED",
    type: "connection",
    message: "The connection was refused"
  },
  {
    type: "connection",
    description: "NS_ERROR_CONTENT_CRASHED",
    message: ""
  },


  /* Error codes return from the proxy */
  {
    description: "NS_ERROR_PROXY_CONNECTION_REFUSED",
    type: "connection",
    message: "The connection to the proxy server was refused"
  },
  {
    description: "NS_ERROR_PROXY_AUTHENTICATION_FAILED",
    type: "connection",
    message: "The proxy requires authentication"
  },
  {
    description: "NS_ERROR_PROXY_BAD_GATEWAY",
    type: "connection",
    message: "The request failed on the proxy"
  },
  {
    description: "NS_ERROR_PROXY_GATEWAY_TIMEOUT",
    type: "connection",
    message: "The request timed out on the proxy"
  },
  {
    description: "NS_ERROR_PROXY_TOO_MANY_REQUESTS",
    type: "connection",
    message: "Sending too many requests to a proxy"
  },
  {
    description: "NS_ERROR_PROXY_VERSION_NOT_SUPPORTED",
    type: "connection",
    message: "The proxy does not support the version of the HTTP request"
  },
  {
    description: "NS_ERROR_PROXY_FORBIDDEN",
    type: "connection",
    message: "The user is banned from the proxy"
  },
  {
    description: "NS_ERROR_PROXY_SERVICE_UNAVAILABLE",
    type: "connection",
    message: "The proxy is not available"
  },
  {
    description: "NS_ERROR_PROXY_UNAVAILABLE_FOR_LEGAL_REASONS",
    message: "The desired destination is unavailable for legal reasons"
  },
  {
    description: "NS_ERROR_NET_TIMEOUT",
    type: "connection",
    message: "The connection has timed out"
  },
  {
    description: "NS_ERROR_NET_TIMEOUT_EXTERNAL",
    type: "connection",
    message: "The request has been cancelled because of a timeout"
  },
  {
    description: "NS_ERROR_OFFLINE",
    type: "connection",
    message: "The requested action could not be completed in the offline state"
  },
  {
    description: "NS_ERROR_PORT_ACCESS_NOT_ALLOWED",
    type: "connection",
    message: "Establishing a connection to an unsafe or otherwise banned port was prohibited"
  },
  {
    description: "NS_ERROR_NET_RESET",
    type: "connection",
    message: "The connection was established, but no data was ever received"
  },
  {
    description: "NS_ERROR_NET_INTERRUPT",
    type: "connection",
    message: "The connection was established, but the data transfer was interrupted"
  },
  {
    description: "NS_ERROR_NET_PARTIAL_TRANSFER",
    type: "connection",
    message: "A transfer was only partially done when it completed"
  },
  {
    description: "NS_ERROR_NET_HTTP3_PROTOCOL_ERROR",
    type: "connection",
    message: "There has been a http3 protocol error"
  },
  {
    description: "NS_ERROR_NOT_RESUMABLE",
    type: "connection",
    message: "This request is not resumable, but it was tried to resume it, or to request resume-specific data"
  },
  {
    description: "NS_ERROR_ENTITY_CHANGED",
    type: "connection",
    message: "It was attempted to resume the request, but the entity has changed in the meantime"
  },
  {
    description: "NS_ERROR_REDIRECT_LOOP",
    type: "connection",
    message: "The request failed as a result of a detected redirection loop"
  },
  {
    description: "NS_ERROR_UNSAFE_CONTENT_TYPE",
    type: "connection",
    message: "The request failed because the content type returned by the server was not a type expected by the channel"
  },
  {
    description: "NS_ERROR_LOAD_SHOWED_ERRORPAGE",
    type: "connection",
    message: "The load caused an error page to be displayed."
  },
  {
    description: "NS_ERROR_BLOCKED_BY_POLICY",
    type: "connection",
    message: "The request was blocked by a policy set by the system administrator."
  },
  {
    description: "NS_ERROR_UNKNOWN_HOST",
    type: "connection",
    message: "The lookup of the hostname failed"
  },
  {
    description: "NS_ERROR_DNS_LOOKUP_QUEUE_FULL",
    type: "connection",
    message: "The DNS lookup queue is full"
  },
  {
    description: "NS_ERROR_UNKNOWN_PROXY_HOST",
    type: "connection",
    message: "The lookup of the proxy hostname failed"
  },
  {
    description: "NS_ERROR_UNKNOWN_SOCKET_TYPE",
    type: "connection",
    message: "The specified socket type does not exist"
  },
  {
    description: "NS_ERROR_SOCKET_CREATE_FAILED",
    type: "connection",
    message: "The specified socket type could not be created"
  },
  {
    description: "NS_ERROR_SOCKET_ADDRESS_NOT_SUPPORTED",
    type: "connection",
    message: "The specified socket address type is not supported"
  },
  {
    description: "NS_ERROR_SOCKET_ADDRESS_IN_USE",
    type: "connection",
    message: "Some other socket is already using the specified address."
  },
  {
    description: "NS_ERROR_INSUFFICIENT_DOMAIN_LEVELS",
    type: "connection",
    message: "The requested number of domain levels exceeds those present in the host string"
  },
  {
    description: "NS_ERROR_HOST_IS_IP_ADDRESS",
    type: "connection",
    message: "The host string is an IP address"
  },
  {
    description: "NS_ERROR_NOT_SAME_THREAD",
    type: "connection",
    message: "Can't access a wrapped JS object from a different thread"
  },

  /* Certificate related errors */
  {
    description: "SEC_ERROR_IO",
    type: "certificate",
    message: "An I/O error occurred during security authorization."
  },
  {
    description: "SEC_ERROR_LIBRARY_FAILURE",
    type: "certificate",
    message: "security library failure."
  },
  {
    description: "SEC_ERROR_BAD_DATA",
    type: "certificate",
    message: "security library: received bad data."
  },
  {
    description: "SEC_ERROR_OUTPUT_LEN",
    type: "certificate",
    message: "security library: output length error."
  },
  {
    description: "SEC_ERROR_INPUT_LEN",
    type: "certificate",
    message: "security library has experienced an input length error."
  },
  {
    description: "SEC_ERROR_INVALID_ARGS",
    type: "certificate",
    message: "security library: invalid arguments."
  },
  {
    description: "SEC_ERROR_INVALID_ALGORITHM",
    type: "certificate",
    message: "security library: invalid algorithm."
  },
  {
    description: "SEC_ERROR_INVALID_AVA",
    type: "certificate",
    message: "security library: invalid AVA."
  },
  {
    description: "SEC_ERROR_INVALID_TIME",
    type: "certificate",
    message: "Improperly formatted time string."
  },
  {
    description: "SEC_ERROR_BAD_DER",
    type: "certificate",
    message: "security library: improperly formatted DER-encoded message."
  },
  {
    description: "SEC_ERROR_BAD_SIGNATURE",
    type: "certificate",
    message: "Peer's certificate has an invalid signature."
  },
  {
    description: "SEC_ERROR_EXPIRED_CERTIFICATE",
    type: "certificate",
    message: "Peer's Certificate has expired."
  },
  {
    description: "SEC_ERROR_REVOKED_CERTIFICATE",
    type: "certificate",
    message: "Peer's Certificate has been revoked."
  },
  {
    description: "SEC_ERROR_UNKNOWN_ISSUER",
    type: "certificate",
    message: "Peer's Certificate issuer is not recognized."
  },
  {
    description: "SEC_ERROR_BAD_KEY",
    type: "certificate",
    message: "Peer's public key is invalid."
  },
  {
    description: "SEC_ERROR_BAD_PASSWORD",
    type: "certificate",
    message: "The security password entered is incorrect."
  },
  {
    description: "SEC_ERROR_RETRY_PASSWORD",
    type: "certificate",
    message: "New password entered incorrectly. Please try again."
  },
  {
    description: "SEC_ERROR_NO_NODELOCK",
    type: "certificate",
    message: "security library: no nodelock."
  },
  {
    description: "SEC_ERROR_BAD_DATABASE",
    type: "certificate",
    message: "security library: bad database."
  },
  {
    description: "SEC_ERROR_NO_MEMORY",
    type: "certificate",
    message: "security library: memory allocation failure."
  },
  {
    description: "SEC_ERROR_UNTRUSTED_ISSUER",
    type: "certificate",
    message: "Peer's certificate issuer has been marked as not trusted by the user."
  },
  {
    description: "SEC_ERROR_UNTRUSTED_CERT",
    type: "certificate",
    message: "Peer's certificate has been marked as not trusted by the user."
  },
  {
    description: "SEC_ERROR_DUPLICATE_CERT",
    type: "certificate",
    message: "Certificate already exists in your database."
  },
  {
    description: "SEC_ERROR_DUPLICATE_CERT_NAME",
    type: "certificate",
    message: "Downloaded certificate's name duplicates one already in your database."
  },
  {
    description: "SEC_ERROR_ADDING_CERT",
    type: "certificate",
    message: "Error adding certificate to database."
  },
  {
    description: "SEC_ERROR_FILING_KEY",
    type: "certificate",
    message: "Error refiling the key for this certificate."
  },
  {
    description: "SEC_ERROR_NO_KEY",
    type: "certificate",
    message: "The private key for this certificate cannot be found in key database"
  },
  {
    description: "SEC_ERROR_CERT_VALID",
    type: "certificate",
    message: "This certificate is valid."
  },
  {
    description: "SEC_ERROR_CERT_NOT_VALID",
    type: "certificate",
    message: "This certificate is not valid."
  },
  {
    description: "SEC_ERROR_CERT_NO_RESPONSE",
    type: "certificate",
    message: "Cert Library: No Response"
  },
  {
    description: "SEC_ERROR_EXPIRED_ISSUER_CERTIFICATE",
    type: "certificate",
    message: "The certificate issuer's certificate has expired. Check your system date and time."
  },
  {
    description: "SEC_ERROR_CRL_EXPIRED",
    type: "certificate",
    message: "The CRL for the certificate's issuer has expired. Update it or check your system date and time."
  },
  {
    description: "SEC_ERROR_CRL_BAD_SIGNATURE",
    type: "certificate",
    message: "The CRL for the certificate's issuer has an invalid signature."
  },
  {
    description: "SEC_ERROR_CRL_INVALID",
    type: "certificate",
    message: "New CRL has an invalid format."
  },
  {
    description: "SEC_ERROR_EXTENSION_VALUE_INVALID",
    type: "certificate",
    message: "Certificate extension value is invalid."
  },
  {
    description: "SEC_ERROR_EXTENSION_NOT_FOUND",
    type: "certificate",
    message: "Certificate extension not found."
  },
  {
    description: "SEC_ERROR_CA_CERT_INVALID",
    type: "certificate",
    message: "Issuer certificate is invalid."
  },
  {
    description: "SEC_ERROR_PATH_LEN_CONSTRAINT_INVALID",
    type: "certificate",
    message: "Certificate path length constraint is invalid."
  },
  {
    description: "SEC_ERROR_CERT_USAGES_INVALID",
    type: "certificate",
    message: "Certificate usages field is invalid."
  },
  {
    description: "SEC_INTERNAL_ONLY",
    type: "certificate",
    message: "**Internal ONLY module**"
  },
  {
    description: "SEC_ERROR_INVALID_KEY",
    type: "certificate",
    message: "The key does not support the requested operation."
  },
  {
    description: "SEC_ERROR_UNKNOWN_CRITICAL_EXTENSION",
    type: "certificate",
    message: "Certificate contains unknown critical extension."
  },
  {
    description: "SEC_ERROR_OLD_CRL",
    type: "certificate",
    message: "New CRL is not later than the current one."
  },
  {
    description: "SEC_ERROR_NO_EMAIL_CERT",
    type: "certificate",
    message: "Not encrypted or signed: you do not yet have an email certificate."
  },
  {
    description: "SEC_ERROR_NO_RECIPIENT_CERTS_QUERY",
    type: "certificate",
    message: "Not encrypted: you do not have certificates for each of the recipients."
  },
  {
    description: "SEC_ERROR_NOT_A_RECIPIENT",
    type: "certificate",
    message: "Cannot decrypt: you are not a recipient, or matching certificate and private key not found."
  },
  {
    description: "SEC_ERROR_PKCS7_KEYALG_MISMATCH",
    type: "certificate",
    message: "Cannot decrypt: key encryption algorithm does not match your certificate."
  },
  {
    description: "SEC_ERROR_PKCS7_BAD_SIGNATURE",
    type: "certificate",
    message: "Signature verification failed: no signer found, too many signers found, or improper or corrupted data."
  },
  {
    description: "SEC_ERROR_UNSUPPORTED_KEYALG",
    type: "certificate",
    message: "Unsupported or unknown key algorithm."
  },
  {
    description: "SEC_ERROR_DECRYPTION_DISALLOWED",
    type: "certificate",
    message: "Cannot decrypt: encrypted using a disallowed algorithm or key size."
  },
  {
    description: "XP_SEC_FORTEZZA_BAD_CARD",
    type: "certificate",
    message: "Fortezza card has not been properly initialized. Please remove it and return it to your issuer."
  },
  {
    description: "XP_SEC_FORTEZZA_NO_CARD",
    type: "certificate",
    message: "No Fortezza cards Found"
  },
  {
    description: "XP_SEC_FORTEZZA_NONE_SELECTED",
    type: "certificate",
    message: "No Fortezza card selected"
  },
  {
    description: "XP_SEC_FORTEZZA_MORE_INFO",
    type: "certificate",
    message: "Please select a personality to get more info on"
  },
  {
    description: "XP_SEC_FORTEZZA_PERSON_NOT_FOUND",
    type: "certificate",
    message: "Personality not found"
  },
  {
    description: "XP_SEC_FORTEZZA_NO_MORE_INFO",
    type: "certificate",
    message: "No more information on that Personality"
  },
  {
    description: "XP_SEC_FORTEZZA_BAD_PIN",
    type: "certificate",
    message: "Invalid Pin"
  },
  {
    description: "XP_SEC_FORTEZZA_PERSON_ERROR",
    type: "certificate",
    message: "Couldn't initialize Fortezza personalities."
  },
  {
    description: "SEC_ERROR_NO_KRL",
    type: "certificate",
    message: "No KRL for this site's certificate has been found."
  },
  {
    description: "SEC_ERROR_KRL_EXPIRED",
    type: "certificate",
    message: "The KRL for this site's certificate has expired."
  },
  {
    description: "SEC_ERROR_KRL_BAD_SIGNATURE",
    type: "certificate",
    message: "The KRL for this site's certificate has an invalid signature."
  },
  {
    description: "SEC_ERROR_REVOKED_KEY",
    type: "certificate",
    message: "The key for this site's certificate has been revoked."
  },
  {
    description: "SEC_ERROR_KRL_INVALID",
    type: "certificate",
    message: "New KRL has an invalid format."
  },
  {
    description: "SEC_ERROR_NEED_RANDOM",
    type: "certificate",
    message: "security library: need random data."
  },
  {
    description: "SEC_ERROR_NO_MODULE",
    type: "certificate",
    message: "security library: no security module can perform the requested operation."
  },
  {
    description: "SEC_ERROR_NO_TOKEN",
    type: "certificate",
    message: "The security card or token does not exist, needs to be initialized, or has been removed."
  },
  {
    description: "SEC_ERROR_READ_ONLY",
    type: "certificate",
    message: "security library: read-only database."
  },
  {
    description: "SEC_ERROR_NO_SLOT_SELECTED",
    type: "certificate",
    message: "No slot or token was selected."
  },
  {
    description: "SEC_ERROR_CERT_NICKNAME_COLLISION",
    type: "certificate",
    message: "A certificate with the same nickname already exists."
  },
  {
    description: "SEC_ERROR_KEY_NICKNAME_COLLISION",
    type: "certificate",
    message: "A key with the same nickname already exists."
  },
  {
    description: "SEC_ERROR_SAFE_NOT_CREATED",
    type: "certificate",
    message: "error while creating safe object"
  },
  {
    description: "SEC_ERROR_BAGGAGE_NOT_CREATED",
    type: "certificate",
    message: "error while creating baggage object"
  },
  {
    description: "XP_JAVA_REMOVE_PRINCIPAL_ERROR",
    type: "certificate",
    message: "Couldn't remove the principal"
  },
  {
    description: "XP_JAVA_DELETE_PRIVILEGE_ERROR",
    type: "certificate",
    message: "Couldn't delete the privilege"
  },
  {
    description: "XP_JAVA_CERT_NOT_EXISTS_ERROR",
    type: "certificate",
    message: "This principal doesn't have a certificate"
  },
  {
    description: "SEC_ERROR_BAD_EXPORT_ALGORITHM",
    type: "certificate",
    message: "Required algorithm is not allowed."
  },
  {
    description: "SEC_ERROR_EXPORTING_CERTIFICATES",
    type: "certificate",
    message: "Error attempting to export certificates."
  },
  {
    description: "SEC_ERROR_IMPORTING_CERTIFICATES",
    type: "certificate",
    message: "Error attempting to import certificates."
  },
  {
    description: "SEC_ERROR_PKCS12_DECODING_PFX",
    type: "certificate",
    message: "Unable to import. Decoding error. File not valid."
  },
  {
    description: "SEC_ERROR_PKCS12_INVALID_MAC",
    type: "certificate",
    message: "Unable to import. Invalid MAC. Incorrect password or corrupt file."
  },
  {
    description: "SEC_ERROR_PKCS12_UNSUPPORTED_MAC_ALGORITHM",
    type: "certificate",
    message: "Unable to import. MAC algorithm not supported."
  },
  {
    description: "SEC_ERROR_PKCS12_UNSUPPORTED_TRANSPORT_MODE",
    type: "certificate",
    message: "Unable to import. Only password integrity and privacy modes supported."
  },
  {
    description: "SEC_ERROR_PKCS12_CORRUPT_PFX_STRUCTURE",
    type: "certificate",
    message: "Unable to import. File structure is corrupt."
  },
  {
    description: "SEC_ERROR_PKCS12_UNSUPPORTED_PBE_ALGORITHM",
    type: "certificate",
    message: "Unable to import. Encryption algorithm not supported."
  },
  {
    description: "SEC_ERROR_PKCS12_UNSUPPORTED_VERSION",
    type: "certificate",
    message: "Unable to import. File version not supported."
  },
  {
    description: "SEC_ERROR_PKCS12_PRIVACY_PASSWORD_INCORRECT",
    type: "certificate",
    message: "Unable to import. Incorrect privacy password."
  },
  {
    description: "SEC_ERROR_PKCS12_CERT_COLLISION",
    type: "certificate",
    message: "Unable to import. Same nickname already exists in database."
  },
  {
    description: "SEC_ERROR_USER_CANCELLED",
    type: "certificate",
    message: "The user pressed cancel."
  },
  {
    description: "SEC_ERROR_PKCS12_DUPLICATE_DATA",
    type: "certificate",
    message: "Not imported, already in database."
  },
  {
    description: "SEC_ERROR_MESSAGE_SEND_ABORTED",
    type: "certificate",
    message: "Message not sent."
  },
  {
    description: "SEC_ERROR_INADEQUATE_KEY_USAGE",
    type: "certificate",
    message: "Certificate key usage inadequate for attempted operation."
  },
  {
    description: "SEC_ERROR_INADEQUATE_CERT_TYPE",
    type: "certificate",
    message: "Certificate type not approved for application."
  },
  {
    description: "SEC_ERROR_CERT_ADDR_MISMATCH",
    type: "certificate",
    message: "Address in signing certificate does not match address in message headers."
  },
  {
    description: "SEC_ERROR_PKCS12_UNABLE_TO_IMPORT_KEY",
    type: "certificate",
    message: "Unable to import. Error attempting to import private key."
  },
  {
    description: "SEC_ERROR_PKCS12_IMPORTING_CERT_CHAIN",
    type: "certificate",
    message: "Unable to import. Error attempting to import certificate chain."
  },
  {
    description: "SEC_ERROR_PKCS12_UNABLE_TO_LOCATE_OBJECT_BY_NAME",
    type: "certificate",
    message: "Unable to export. Unable to locate certificate or key by nickname."
  },
  {
    description: "SEC_ERROR_PKCS12_UNABLE_TO_EXPORT_KEY",
    type: "certificate",
    message: "Unable to export. Private Key could not be located and exported."
  },
  {
    description: "SEC_ERROR_PKCS12_UNABLE_TO_WRITE",
    type: "certificate",
    message: "Unable to export. Unable to write the export file."
  },
  {
    description: "SEC_ERROR_PKCS12_UNABLE_TO_READ",
    type: "certificate",
    message: "Unable to import. Unable to read the import file."
  },
  {
    description: "SEC_ERROR_PKCS12_KEY_DATABASE_NOT_INITIALIZED",
    type: "certificate",
    message: "Unable to export. Key database corrupt or deleted."
  },
  {
    description: "SEC_ERROR_KEYGEN_FAIL",
    type: "certificate",
    message: "Unable to generate public/private key pair."
  },
  {
    description: "SEC_ERROR_INVALID_PASSWORD",
    type: "certificate",
    message: "Password entered is invalid. Please pick a different one."
  },
  {
    description: "SEC_ERROR_RETRY_OLD_PASSWORD",
    type: "certificate",
    message: "Old password entered incorrectly. Please try again."
  },
  {
    description: "SEC_ERROR_BAD_NICKNAME",
    type: "certificate",
    message: "Certificate nickname already in use."
  },
  {
    description: "SEC_ERROR_NOT_FORTEZZA_ISSUER",
    type: "certificate",
    message: "Peer FORTEZZA chain has a non-FORTEZZA Certificate."
  },
  {
    description: "SEC_ERROR_CANNOT_MOVE_SENSITIVE_KEY",
    type: "certificate",
    message: "A sensitive key cannot be moved to the slot where it is needed."
  },
  {
    description: "SEC_ERROR_JS_INVALID_MODULE_NAME",
    type: "certificate",
    message: "Invalid module name."
  },
  {
    description: "SEC_ERROR_JS_INVALID_DLL",
    type: "certificate",
    message: "Invalid module path/filename"
  },
  {
    description: "SEC_ERROR_JS_ADD_MOD_FAILURE",
    type: "certificate",
    message: "Unable to add module"
  },
  {
    description: "SEC_ERROR_JS_DEL_MOD_FAILURE",
    type: "certificate",
    message: "Unable to delete module"
  },
  {
    description: "SEC_ERROR_OLD_KRL",
    type: "certificate",
    message: "New KRL is not later than the current one."
  },
  {
    description: "SEC_ERROR_CKL_CONFLICT",
    type: "certificate",
    message: "New CKL has different issuer than current CKL. Delete current CKL."
  },
  {
    description: "SEC_ERROR_CERT_NOT_IN_NAME_SPACE",
    type: "certificate",
    message: "The Certifying Authority for this certificate is not permitted to issue a certificate with this name."
  },
  {
    description: "SEC_ERROR_KRL_NOT_YET_VALID",
    type: "certificate",
    message: "The key revocation list for this certificate is not yet valid."
  },
  {
    description: "SEC_ERROR_CRL_NOT_YET_VALID",
    type: "certificate",
    message: "The certificate revocation list for this certificate is not yet valid."
  },
  {
    description: "SEC_ERROR_UNKNOWN_CERT",
    type: "certificate",
    message: "The requested certificate could not be found."
  },
  {
    description: "SEC_ERROR_UNKNOWN_SIGNER",
    type: "certificate",
    message: "The signer's certificate could not be found."
  },
  {
    description: "SEC_ERROR_CERT_BAD_ACCESS_LOCATION",
    type: "certificate",
    message: "The location for the certificate status server has invalid format."
  },
  {
    description: "SEC_ERROR_OCSP_UNKNOWN_RESPONSE_TYPE",
    type: "certificate",
    message: "The OCSP response cannot be fully decoded; it is of an unknown type."
  },
  {
    description: "SEC_ERROR_OCSP_BAD_HTTP_RESPONSE",
    type: "certificate",
    message: "The OCSP server returned unexpected/invalid HTTP data."
  },
  {
    description: "SEC_ERROR_OCSP_MALFORMED_REQUEST",
    type: "certificate",
    message: "The OCSP server found the request to be corrupted or improperly formed."
  },
  {
    description: "SEC_ERROR_OCSP_SERVER_ERROR",
    type: "certificate",
    message: "The OCSP server experienced an internal error."
  },
  {
    description: "SEC_ERROR_OCSP_TRY_SERVER_LATER",
    type: "certificate",
    message: "The OCSP server suggests trying again later."
  },
  {
    description: "SEC_ERROR_OCSP_REQUEST_NEEDS_SIG",
    type: "certificate",
    message: "The OCSP server requires a signature on this request."
  },
  {
    description: "SEC_ERROR_OCSP_UNAUTHORIZED_REQUEST",
    type: "certificate",
    message: "The OCSP server has refused this request as unauthorized."
  },
  {
    description: "SEC_ERROR_OCSP_UNKNOWN_RESPONSE_STATUS",
    type: "certificate",
    message: "The OCSP server returned an unrecognizable status."
  },
  {
    description: "SEC_ERROR_OCSP_UNKNOWN_CERT",
    type: "certificate",
    message: "The OCSP server has no status for the certificate."
  },
  {
    description: "SEC_ERROR_OCSP_NOT_ENABLED",
    type: "certificate",
    message: "You must enable OCSP before performing this operation."
  },
  {
    description: "SEC_ERROR_OCSP_NO_DEFAULT_RESPONDER",
    type: "certificate",
    message: "You must set the OCSP default responder before performing this operation."
  },
  {
    description: "SEC_ERROR_OCSP_MALFORMED_RESPONSE",
    type: "certificate",
    message: "The response from the OCSP server was corrupted or improperly formed."
  },
  {
    description: "SEC_ERROR_OCSP_UNAUTHORIZED_RESPONSE",
    type: "certificate",
    message: "The signer of the OCSP response is not authorized to give status for this certificate."
  },
  {
    description: "SEC_ERROR_OCSP_FUTURE_RESPONSE",
    type: "certificate",
    message: "The OCSP response is not yet valid (contains a date in the future)."
  },
  {
    description: "SEC_ERROR_OCSP_OLD_RESPONSE",
    type: "certificate",
    message: "The OCSP response contains out-of-date information."
  },
  {
    description: "SEC_ERROR_DIGEST_NOT_FOUND",
    type: "certificate",
    message: "The CMS or PKCS #7 Digest was not found in signed message."
  },
  {
    description: "SEC_ERROR_UNSUPPORTED_MESSAGE_TYPE",
    type: "certificate",
    message: "The CMS or PKCS #7 Message type is unsupported."
  },
  {
    description: "SEC_ERROR_MODULE_STUCK",
    type: "certificate",
    message: "PKCS #11 module could not be removed because it is still in use."
  },
  {
    description: "SEC_ERROR_BAD_TEMPLATE",
    type: "certificate",
    message: "Could not decode ASN.1 data. Specified template was invalid."
  },
  {
    description: "SEC_ERROR_CRL_NOT_FOUND",
    type: "certificate",
    message: "No matching CRL was found."
  },
  {
    description: "SEC_ERROR_REUSED_ISSUER_AND_SERIAL",
    type: "certificate",
    message: "You are attempting to import a cert with the same issuer/serial as an existing cert, but that is not the same cert."
  },
  {
    description: "SEC_ERROR_BUSY",
    type: "certificate",
    message: "NSS could not shutdown. Objects are still in use."
  },
  {
    description: "SEC_ERROR_EXTRA_INPUT",
    type: "certificate",
    message: "DER-encoded message contained extra unused data."
  },
  {
    description: "SEC_ERROR_UNSUPPORTED_ELLIPTIC_CURVE",
    type: "certificate",
    message: "Unsupported elliptic curve."
  },
  {
    description: "SEC_ERROR_UNSUPPORTED_EC_POINT_FORM",
    type: "certificate",
    message: "Unsupported elliptic curve point form."
  },
  {
    description: "SEC_ERROR_UNRECOGNIZED_OID",
    type: "certificate",
    message: "Unrecognized Object Identifier."
  },
  {
    description: "SEC_ERROR_OCSP_INVALID_SIGNING_CERT",
    type: "certificate",
    message: "Invalid OCSP signing certificate in OCSP response."
  },
  {
    description: "SEC_ERROR_REVOKED_CERTIFICATE_CRL",
    type: "certificate",
    message: "Certificate is revoked in issuer's certificate revocation list."
  },
  {
    description: "SEC_ERROR_REVOKED_CERTIFICATE_OCSP",
    type: "certificate",
    message: "Issuer's OCSP responder reports certificate is revoked."
  },
  {
    description: "SEC_ERROR_CRL_INVALID_VERSION",
    type: "certificate",
    message: "Issuer's Certificate Revocation List has an unknown version number."
  },
  {
    description: "SEC_ERROR_CRL_V1_CRITICAL_EXTENSION",
    type: "certificate",
    message: "Issuer's V1 Certificate Revocation List has a critical extension."
  },
  {
    description: "SEC_ERROR_CRL_UNKNOWN_CRITICAL_EXTENSION",
    type: "certificate",
    message: "Issuer's V2 Certificate Revocation List has an unknown critical extension."
  },
  {
    description: "SEC_ERROR_UNKNOWN_OBJECT_TYPE",
    type: "certificate",
    message: "Unknown object type specified."
  },
  {
    description: "SEC_ERROR_INCOMPATIBLE_PKCS11",
    type: "certificate",
    message: "PKCS #11 driver violates the spec in an incompatible way."
  },
  {
    description: "SEC_ERROR_NO_EVENT",
    type: "certificate",
    message: "No new slot event is available at this time."
  },
  {
    description: "SEC_ERROR_CRL_ALREADY_EXISTS",
    type: "certificate",
    message: "CRL already exists."
  },
  {
    description: "SEC_ERROR_NOT_INITIALIZED",
    type: "certificate",
    message: "NSS is not initialized."
  },
  {
    description: "SEC_ERROR_TOKEN_NOT_LOGGED_IN",
    type: "certificate",
    message: "The operation failed because the PKCS#11 token is not logged in."
  },
  {
    description: "SEC_ERROR_OCSP_RESPONDER_CERT_INVALID",
    type: "certificate",
    message: "Configured OCSP responder's certificate is invalid."
  },
  {
    description: "SEC_ERROR_OCSP_BAD_SIGNATURE",
    type: "certificate",
    message: "OCSP response has an invalid signature."
  },
  {
    description: "SEC_ERROR_OUT_OF_SEARCH_LIMITS",
    type: "certificate",
    message: "Cert validation search is out of search limits"
  },
  {
    description: "SEC_ERROR_INVALID_POLICY_MAPPING",
    type: "certificate",
    message: "Policy mapping contains anypolicy"
  },
  {
    description: "SEC_ERROR_POLICY_VALIDATION_FAILED",
    type: "certificate",
    message: "Cert chain fails policy validation"
  },
  {
    description: "SEC_ERROR_UNKNOWN_AIA_LOCATION_TYPE",
    type: "certificate",
    message: "Unknown location type in cert AIA extension"
  },
  {
    description: "SEC_ERROR_BAD_HTTP_RESPONSE",
    type: "certificate",
    message: "Server returned bad HTTP response"
  },
  {
    description: "SEC_ERROR_BAD_LDAP_RESPONSE",
    type: "certificate",
    message: "Server returned bad LDAP response"
  },
  {
    description: "SEC_ERROR_FAILED_TO_ENCODE_DATA",
    type: "certificate",
    message: "Failed to encode data with ASN1 encoder"
  },
  {
    description: "SEC_ERROR_BAD_INFO_ACCESS_LOCATION",
    type: "certificate",
    message: "Bad information access location in cert extension"
  },
  {
    description: "SEC_ERROR_LIBPKIX_INTERNAL",
    type: "certificate",
    message: "Libpkix internal error occurred during cert validation."
  },
  {
    description: "SEC_ERROR_PKCS11_GENERAL_ERROR",
    type: "certificate",
    message: "A PKCS #11 module returned CKR_GENERAL_ERROR, indicating that an unrecoverable error has occurred."
  },
  {
    description: "SEC_ERROR_PKCS11_FUNCTION_FAILED",
    type: "certificate",
    message: "A PKCS #11 module returned CKR_FUNCTION_FAILED, indicating that the requested function could not be performed. Trying the same operation again might succeed."
  },
  {
    description: "SEC_ERROR_PKCS11_DEVICE_ERROR",
    type: "certificate",
    message: "A PKCS #11 module returned CKR_DEVICE_ERROR, indicating that a problem has occurred with the token or slot."
  },
  {
    description: "SEC_ERROR_BAD_INFO_ACCESS_METHOD",
    type: "certificate",
    message: "Unknown information access method in certificate extension."
  },
  {
    description: "SEC_ERROR_CRL_IMPORT_FAILED",
    type: "certificate",
    message: "Error attempting to import a CRL."
  },
  {
    description: "SEC_ERROR_EXPIRED_PASSWORD",
    type: "certificate",
    message: "The password expired."
  },
  {
    description: "SEC_ERROR_LOCKED_PASSWORD",
    type: "certificate",
    message: "The password is locked."
  },
  {
    description: "SEC_ERROR_UNKNOWN_PKCS11_ERROR",
    type: "certificate",
    message: "Unknown PKCS #11 error."
  },
  {
    description: "SEC_ERROR_BAD_CRL_DP_URL",
    type: "certificate",
    message: "Invalid or unsupported URL in CRL distribution point name."
  },
  {
    description: "SEC_ERROR_CERT_SIGNATURE_ALGORITHM_DISABLED",
    type: "certificate",
    message: "The certificate was signed using a signature algorithm that is disabled because it is not secure."
  },
  {
    description: "SEC_ERROR_LEGACY_DATABASE",
    type: "certificate",
    message: "The certificate/key database is in an old, unsupported format."
  },
  {
    description: "SEC_ERROR_APPLICATION_CALLBACK_ERROR",
    type: "certificate",
    message: "The certificate was rejected by extra checks in the application."
  },
  {
    description: "SEC_ERROR_INVALID_STATE",
    type: "certificate",
    message: "The attempted operation is invalid for the current state."
  },
  {
    description: "SEC_ERROR_POLICY_LOCKED",
    type: "certificate",
    message: "Could not change the policy because the policy is now locked."
  },
  {
    description: "SEC_ERROR_SIGNATURE_ALGORITHM_DISABLED",
    type: "certificate",
    message: "Could not create or verify a signature using a signature algorithm that is disabled because it is not secure."
  },
  {
    description: "SEC_ERROR_ALGORITHM_MISMATCH",
    type: "certificate",
    message: "The signature algorithm in the signature field of the certificate does not match the algorithm in its signatureAlgorithm field."
  },

  /* Cache related errors */

  {
    description: "NS_ERROR_CACHE_KEY_NOT_FOUND",
    type: "cache",
    message: "Cache key could not be found"
  },
  {
    description: "NS_ERROR_CACHE_DATA_IS_STREAM",
    type: "cache",
    message: "Cache data is a stream"
  },
  {
    description: "NS_ERROR_CACHE_DATA_IS_NOT_STREAM",
    type: "cache",
    message: "Cache data is not a stream"
  },
  {
    description: "NS_ERROR_CACHE_WAIT_FOR_VALIDATION",
    type: "cache",
    message: "Cache entry exists but needs to be validated first"
  },
  {
    description: "NS_ERROR_CACHE_ENTRY_DOOMED",
    type: "cache",
    message: "Cache entry has been  doomed"
  },
  {
    description: "NS_ERROR_CACHE_READ_ACCESS_DENIED",
    type: "cache",
    message: "Read access to cache denied"
  },
  {
    description: "NS_ERROR_CACHE_WRITE_ACCESS_DENIED",
    type: "cache",
    message: "Write access to cache denied"
  },
  {
    description: "NS_ERROR_CACHE_IN_USE",
    type: "cache",
    message: "Cache is currently in use"
  },
  {
    description: "NS_ERROR_DOCUMENT_NOT_CACHED",
    type: "cache",
    message: "Document does not exist in cache"
  },
]