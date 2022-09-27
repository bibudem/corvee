import http307 from './http-307.js'
import http30xAllTempRedirects from './http-30x-all-temporary-redirects.js'
import http30xCircularRedirection from './http-30x-circular-redirection.js'
import http30xHttpsUpgradeAny from './http-30x-https-upgrade-any.js'
import http30xHttpsUpgradeLoose from './http-30x-https-upgrade-loose.js'
import http30xHttpsUpgradeStrict from './http-30x-https-upgrade-strict.js'
import http30xMissingSlash from './http-30x-missing-slash.js'
import http30xPermanentRedirectFailure from './http-30x-permanent-redirect-failure.js'
import http30xPermanentRedirectSuccessfull from './http-30x-permanent-redirect-successful.js'
import http30xWelcomePage from './http-30x-redirect-to-welcome-page.js'
import http400 from './http-400.js'
import http401 from './http-401.js'
import http403 from './http-403.js'
import http404 from './http-404.js'
import http404ByUrl from './http-404-by-url.js'
import http408 from './http-408.js'
import http410 from './http-410.js'
import http429 from './http-429.js'
import http500 from './http-500.js'
import http501 from './http-501.js'
import http502 from './http-502.js'
import http503 from './http-503.js'
import http512599 from './http-512-599.js'
import http6xx from './http-6xx.js'

import mailInvalidSyntax from './mail-invalid-syntax.js'
import mailUnverifiedAddress from './mail-unverified-address.js'

import netSystem from './net-system.js'
import netConnection from './net-connection.js'
import netCertificate from './net-certificate.js'
import netHttp from './net-http.js'

import urlIgnoreThese from './url-ignore-these.js'
import urlInvalidUrl from './url-invalid-url.js'
import urlShorten from './url-shorten.js'

export * from './messages/fr-CA.js'

export const filters = {
    http307,
    http30xAllTempRedirects,
    http30xCircularRedirection,
    http30xHttpsUpgradeAny,
    http30xHttpsUpgradeLoose,
    http30xHttpsUpgradeStrict,
    http30xMissingSlash,
    http30xPermanentRedirectFailure,
    http30xPermanentRedirectSuccessfull,
    http30xWelcomePage,
    http400,
    http401,
    http403,
    http404,
    http404ByUrl,
    http408,
    http410,
    http429,
    http500,
    http501,
    http502,
    http503,
    http512599,
    http6xx,

    mailInvalidSyntax,
    mailUnverifiedAddress,

    netSystem,
    netConnection,
    netCertificate,
    netHttp,

    urlIgnoreThese,
    urlInvalidUrl,
    urlShorten,
}