import http30xAllTempRedirects from './http-30x-all-temporary-redirects.js'
import http30xCircularRedirection from './http-30x-circular-redirection.js'
import http30xHttpsUpgradeAny from './http-30x-https-upgrade-any.js'
import http30xHttpsUpgradeLoose from './http-30x-https-upgrade-loose.js'
import http30xHttpsUpgradeStrict from './http-30x-https-upgrade-strict.js'
import http30xMissingSlash from './http-30x-missing-slash.js'
import http30xPermanentRedirectFailure from './http-30x-permanent-redirect-failure.js'
import http30xPermanentRedirectSuccessfull from './http-30x-permanent-redirect-successful.js'
import http30xWelcomePage from './http-30x-redirect-to-welcome-page.js'
import http307HSTSRedirect from './http-307-HSTS-redirect.js'
import http404ByUrl from './http-404-by-url.js'

import mailInvalidSyntax from './mail-invalid-syntax.js'

import netSystem from './net-system.js'
import netConnection from './net-connection.js'
import netCertificate from './net-certificate.js'
import netHttp from './net-http.js'

import urlIgnoreThese from './url-ignore-these.js'
import urlInvalidUrl from './url-invalid-url.js'
import urlShorten from './url-shorten.js'

export * from './messages/fr-CA.js'

export const filters = {
    http30xAllTempRedirects,
    http30xCircularRedirection,
    http30xHttpsUpgradeAny,
    http30xHttpsUpgradeLoose,
    http30xHttpsUpgradeStrict,
    http30xMissingSlash,
    http30xPermanentRedirectFailure,
    http30xPermanentRedirectSuccessfull,
    http30xWelcomePage,
    http307HSTSRedirect,
    http404ByUrl,

    // mailInvalidSyntax,

    netSystem,
    netConnection,
    netCertificate,
    netHttp,

    urlIgnoreThese,
    // urlInvalidUrl,
    urlShorten,
}