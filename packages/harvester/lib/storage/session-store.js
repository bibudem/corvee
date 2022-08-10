import { openKeyValueStore } from 'apify';
import { console } from '../../../core'

export async function sessionStore({
    interval = 5000,
    resume = false
} = {}) {

    const store = await openKeyValueStore('session');

    let storedData = {};

    if (!resume) {
        await store.setValue('data', {});
    } else {
        storedData = await store.getValue('data');
    }

    const data = {
        ...storedData
    };

    const proxyData = new Proxy(data, {});

    const save = async () => {
        await store.setValue('data', data);
    }

    await save();

    setInterval(save, interval);

    return proxyData;
}