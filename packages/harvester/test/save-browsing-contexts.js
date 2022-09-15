import fs from 'fs'
import path from 'node:path'

import {
    console
}
    from '../../core/lib/logger'

export default function saveBrowsingContexts(dir, harvester) {

    harvester.on('browsing-contexts', function onBrowsingContexts(data) {

        fs.writeFileSync(path.join(dir, 'browsing-contexts.json'), JSON.stringify(data, null, 2), 'utf8');

    })
}