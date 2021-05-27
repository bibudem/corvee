import server from '../test/http-status/server';

import {
    console
}
    from '../../core/lib/logger';

try {
    server.listen(3000, () => {
        console.log('Server running.')
    });
    console.log(`Server listening port 3000.`);
} catch (e) {
    console.error(e)
}