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

    const ret = new Proxy(data, {});

    const save = async () => {
        // console.log(`saving ${JSON.stringify(data)}`)
        await store.setValue('data', data);
        // setTimeout(save, interval);
    }

    await save();

    setInterval(save, interval);

    return ret;
}