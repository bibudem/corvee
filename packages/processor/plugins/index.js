import http200 from './http-200'
import http30xAllTempRedirects from './http-30x-all-temporary-redirects'
import http30xPermanentRedirect from './http-30x-permanent-redirect'
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
import http500 from './http-500'
import http501 from './http-501'
import http502 from './http-502'
import http503 from './http-503'
import http550 from './http-550'
import http5xx from './http-5xx'

import net from './net'

import urlIgnoreThese from './url-ignore-these'
import urlShorten from './url-shorten'

export const plugins = {
    http200,
    http307,
    http30xAllTempRedirects,
    http30xPermanentRedirect,
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
    http500,
    http501,
    http502,
    http503,
    http550,
    // http5xx,

    net,

    urlShorten,
    urlIgnoreThese,
}

export {
    default as messages
}
from './messages'