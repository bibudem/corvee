import {
    config,
    adressesSimplifiees
}
from '../../../../packages/harvester/test/bib/config'

export {
    default as excludedUrls
}
from './excluded-urls'

import {
    default as devExcludedUrls
} from './dev-excluded-urls'

// export excludedUrls;
export const urlsExcludedFromHarvester = config.ignore;
export const devExcludeUrls = [...devExcludedUrls, ...config.ignore];
export {
    adressesSimplifiees
};

export const urlsAs404 = [
    'erreur-404' // https://www.inesss.qc.ca/erreur-404-error.html
]