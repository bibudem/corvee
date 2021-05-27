import PQueue from 'p-queue';

// import {
//     computeUniqueKey
// } from 'apify/build/request'

// export class RequestQueue {

//     async function addToRequestQueue(which, linkDataset) {
//         if (typeof linkDataset === 'undefined') {
//             linkDataset = which;
//             which = 'pup'
//         }

//         assert.string(which)

//         if (!Array.isArray(linkDataset)) {
//             linkDataset = [linkDataset]
//         }

//         const queue = which === 'basic' ? basicRequestQueue : puppeteerRequestQueue;
//         let uriObj;

//         const addRequestPromises = [];

//         linkDataset.forEach(async data => {

//             self.emit('add-link', data);

//             data = new Link(data);

//             assert.object(data)
//             assert.string(data.url)
//             assert.object(data.userData)

//             try {
//                 uriObj = URI.parse(data.url);
//             } catch (e) {
//                 console.error(`Missing url property: ${JSON.stringify(data, null, 2)}`)
//                 console.error(e);
//                 process.exit();
//             }

//             if (!self.config.schemes.some(scheme => minimatch(uriObj.scheme, scheme))) {
//                 console.verbose(`Unsupported scheme: ${uriObj.scheme} ${data.url ? `at uri <${data.url}>`: ''}`)
//                 return;
//             }

//             if (uriObj.scheme === 'mailto') {
//                 const record = handleResponse(data, {
//                     userData: {
//                         //parent,
//                         reports: [{
//                             status: 'mail-unverified-address',
//                             description: 'Email link. Checking only syntax.'
//                         }],
//                         status: 'mail-unverified-address',
//                         trials: 1
//                     }
//                 }, {
//                     _from: 'parseLinksInPage'
//                 })

//                 await addRecord(record);
//                 activeRequestsCount++;
//                 puppeteerCrawler.basicCrawler.handledRequestsCount++;

//                 return;
//             }

//             const trials = data.trials || 1;
//             const extern = self.isExternLink(data.url)

//             const requestData = extend(true, {}, data, {
//                 retryCount: trials,
//                 extern
//             })

//             const noFollowUrl = self.shouldNotFollowUrl(requestData.userData.parent)
//             if (noFollowUrl) {
//                 console.debug(`Rejecting link ${requestData.url} in ${requestData.userData.parent} since a noFollow rule was detected: ${noFollowUrl}`)
//                 return;
//             }

//             // Stop processing if filtering settings meet
//             const ignoreRule = self.shouldIgnoreUrl(requestData.url)
//             if (ignoreRule) {
//                 const msg = `Ignoring this url based on config.ignore rule \`${ignoreRule}\`: [${requestData.userData.parent}] -> ${requestData.url}`;
//                 console.debug(msg);
//                 // const e = new CorveeError(msg, 'skip-ignore')
//                 // request.userData.reports.push(e)
//                 return;
//             }

//             // This should not occur
//             if (self.isExternLink(requestData.userData.parent)) {
//                 console.warn(`[TODO] Intercepted an URL hosted on an external page that was submitted to fetch queue: [${requestData.userData.parent}] -> ${requestData.url}.`)
//                 return;
//             }

//             //console.info(`Adding request to queue: ${requestData.userData.parent} -> ${requestData.url}`)

//             // addRequestPromises.push(queue.addRequest(requestData))

//             if (!self.fetchLinksOnce) {
//                 requestData.uniqueKey = `${computeUniqueKey(requestData.url, 'GET', null, false, false)}:${Date.now()}:${Math.floor(Math.random() * 1E6)}`;
//             }

//             const reqInfo = await queue.addRequest(requestData);

//             if (reqInfo.wasAlreadyPresent) {

//                 const linkId = idFromUrl(requestData.url);

//                 const record = await linkStore.getValue(linkId);

//                 if (record && requestData.userData.parent !== record.parent) {

//                     // console.me('record:', record)
//                     // console.me('requestData', requestData)

//                     // process.exit();

//                     const newRecord = extend(true, {}, _.omit(record, ['id', 'created', 'timing']), _.pick(requestData.userData, ['level', 'parent', 'text', 'trials']), {
//                         _from: 'parseLinksInPage',
//                         created: new Date().toISOString(),
//                         trials: 1
//                     })

//                     await addRecord(newRecord);
//                     activeRequestsCount++;
//                     puppeteerCrawler.basicCrawler.handledRequestsCount++;
//                 }

//                 // if (!parentsStore.has(requestData.url)) {
//                 //     parentsStore.set(requestData.url, new Set())
//                 // }
//                 // parentsStore.get(requestData.url).add(requestData.userData.parent)

//                 return
//             } else {
//                 addRequestPromises.push(reqInfo)
//             }

//             // addRequestPromises.push(async () => {
//             //     return new Promise(async resolve => {
//             //         const reqInfo = queue.addRequest(requestData);
//             //         // if (reqInfo.wasAlreadyPresent) {
//             //         //     console.info(`wasAlreadyPresent: `)
//             //         //     const req = await queue.getRequest(reqInfo.requestId)
//             //         //     req.userData.parents.push(requestData.parent)
//             //         //     await queue.reclaimRequest(req)
//             //         //     return resolve(req)
//             //         // }
//             //         resolve(requestData)
//             //     })
//             // });
//         })

//         return Promise.all(addRequestPromises);
//         // .then(queueOperationInfos => {
//         //     console.info(JSON.stringify(queueOperationInfos, null, 2))
//         // })
//     }
// }

export class RequestQueue extends PQueue {
    constructor() {
        super(...arguments);

    }
}