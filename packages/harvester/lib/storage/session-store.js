import {
    openKeyValueStore
} from 'apify';

// import v from 'io-validate'
// import extend from 'extend';

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

// export class SessionStore {

//     constructor({
//         interval = 500,
//         props = {}
//     } = {}) {
//         this._store = null;
//         this._interval = interval;
//         this.props = props;

//         this.init();

//         return new Proxy(this.props, {})

//     }

//     async init() {
//         this._store = await openKeyValueStore('session');
//         await this.save();
//     }

//     async save() {
//         await this._store.setValue('data', this.props);
//         setTimeout(this.save, this._interval);
//     }
// }