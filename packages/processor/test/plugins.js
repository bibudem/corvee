import * as config from './config'
import {
    plugins as _
} from '../plugins'

export const plugins = [{
        ..._.http200,
        exclude: true
    },
    {
        ..._.http30xAllTempRedirects,
        //  exclude: true
    },
    {
        ..._.http30xPermanentRedirect,
        exclude: true
    },
    {
        ..._.http307
    },
    {
        ..._.http30xMissingSlash,
        exclude: true // KEEP
    },
    _.http30xWelcomePage,
    {
        ..._.http30xCircularRedirection,
        exclude: true // KEEP
    },
    new _.http30xHttpsUpgrade({
        ignoreWww: true,
        exclude: true
    }),
    new _.http30xHttpsUpgradeLoose({
        ignoreWww: true,
        exclude: true
    }),
    {
        ..._.http30xHttpsUpgradeAny
    },
    {
        ..._.http400,
        exclude: true
    },
    _.http401,
    {
        ..._.http403,
        exclude: true
    },
    {
        ..._.http404,
        exclude: true
    },
    {
        ..._.http404ByUrls(config.urlsAs404),
        exclude: true
    },
    {
        ..._.http500,
        exclude: true,
    },
    {
        ..._.http501,
        //  exclude: true,
    },
    {
        ..._.http502,
        //  exclude: true,
    },
    {
        ..._.http503,
        exclude: true,
    },
    {
        ..._.http550,
        //  exclude: true,
    },

    {
        ..._.net,
        exclude: true
    },


    _.urlIgnoreThese(config.excludedUrls),

    //
    //
    //

    {
        ..._.bibHttp30xRedirectionTypo3,
        exclude: true
    },
    _.udemHttp30xCalendrier,
    _.urlShorten,
    {
        ..._.bibHttpsUpgrade,
        exclude: true
    },
    _.bibAncienAtrium,
    {
        ..._.bibAtriumNonSecurise,
        //  exclude: true
    },
    _.isBadAdresseSimplifiee({
        urls: config.adressesSimplifiees,
        // exclude: true
    }),
    _.bibExamensAnneesAnterieures,
    _.bibPretReseau, {
        ..._.publicAuthServices,
        //  exclude: true
    },
    _.studiumLogin,
]