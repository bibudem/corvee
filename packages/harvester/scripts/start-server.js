import server from '../test/http-status/server.js'

import { console, inspect } from '@corvee/core'

try {
    server.listen(3000, () => {
        console.log('Server running.')
    })
    console.log(`Server listening port 3000.`)
} catch (e) {
    console.error(inspect(e))
}