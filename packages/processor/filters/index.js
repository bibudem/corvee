import http200 from './http-200'
import http204 from './http-204'
import http30xAllTempRedirects from './http-30x-all-temporary-redirects'
import http30xPermanentRedirectFailure from './http-30x-permanent-redirect-failure'
import http30xPermanentRedirectSuccessfull from './http-30x-permanent-redirect-successful'
import http307 from './http-307'
import http30xMissingSlash from './http-30x-missing-slash'
import http30xWelcomePage from './http-30x-redirect-to-welcome-page'
import http30xCircularRedirection from './http-30x-circular-redirection'
import http30xHttpsUpgrade from './http-30x-https-upgrade'
import http30xHttpsUpgradeLoose from './http-30x-https-upgrade-loose'
import http30xHttpsUpgradeAny from './http-30x-https-upgrade-any'
import http400 from './http-400'
import http401 from './http-401'
import http403 from './http-403'
import http404 from './http-404'
import http404ByUrls from './http-404-by-url'
import http408 from './http-408'
import http410 from './http-410'
import http429 from './http-429'
import http500 from './http-500'
import http501 from './http-501'
import http502 from './http-502'
import http503 from './http-503'
import http512599 from './http-512-599'
import http5xx from './http-5xx'

import mailInvalidSyntax from './mail-invalid-syntax'
import mailUnverifiedAddress from './mail-unverified-address'

import netSystem from './net-system'
import netConnection from './net-connection'
import netCertificate from './net-certificate'
import netHttp from './net-http'

import urlIgnoreThese from './url-ignore-these'
import urlInvalidUrl from './url-invalid-url'
import urlShorten from './url-shorten'

export * from './messages/fr-CA'

export const filters = {
    http200,
    http204,
    http307,
    http30xAllTempRedirects,
    http30xPermanentRedirectFailure,
    http30xPermanentRedirectSuccessfull,
    http30xMissingSlash,
    http30xWelcomePage,
    http30xCircularRedirection,
    http30xHttpsUpgrade,
    http30xHttpsUpgradeLoose,
    http30xHttpsUpgradeAny,
    http400,
    http401,
    http403,
    http404,
    http404ByUrls,
    http408,
    http410,
    http429,
    http500,
    http501,
    http502,
    http503,
    http512599,
    // http5xx,

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