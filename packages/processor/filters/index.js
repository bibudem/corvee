import http30xAllTempRedirects from './http-30x-all-temporary-redirects.js'
import http30xCircularRedirection from './http-30x-circular-redirection.js'
import http30xHttpsUpgradeAny from './http-30x-https-upgrade-any.js'
import Http30xHttpsUpgradeLoose from './http-30x-https-upgrade-loose.js'
import Http30xHttpsUpgradeStrict from './http-30x-https-upgrade-strict.js'
import http30xSlash from './http-30x-slash.js'
import http30xPermanentRedirectFailure from './http-30x-permanent-redirect-failure.js'
import Http30xPermanentRedirectSuccessful from './http-30x-permanent-redirect-successful.js'
import http30xRedirectToWelcomePage from './http-30x-redirect-to-welcome-page.js'
import Http30xRootToPathPermanentRedirect from './http-30x-root-to-path-permanent-redirect.js'
import http307HSTSRedirect from './http-307-HSTS-redirect.js'
import http404ByUrl from './http-404-by-url.js'

import netSystem from './net-system.js'
import netConnection from './net-connection.js'
import netCertificate from './net-certificate.js'
import netHttp from './net-http.js'

import urlIgnoreThese from './url-ignore-these.js'
import urlShorten from './url-shorten.js'

export * from './filter.js'

export * from './messages/fr-CA.js'

export const filters = {
    http30xAllTempRedirects,
    http30xCircularRedirection,
    http30xHttpsUpgradeAny,
    Http30xHttpsUpgradeLoose,
    Http30xHttpsUpgradeStrict,
    http30xSlash,
    http30xPermanentRedirectFailure,
    Http30xPermanentRedirectSuccessful,
    http30xRedirectToWelcomePage,
    Http30xRootToPathPermanentRedirect,
    http307HSTSRedirect,
    http404ByUrl,

    netSystem,
    netConnection,
    netCertificate,
    netHttp,

    urlIgnoreThese,
    urlShorten,
}