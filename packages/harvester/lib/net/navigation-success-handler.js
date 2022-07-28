import { console } from '../../../core'

export async function onNavigationRequest({
    request,
    response: pupResponse,
    page
}) {

    const requestEnd = Date.now();
    request.userData.perfNavigationResponseSuccess = await getPerformanceData(page, request.url)
    //console.warn(`${await puppeteerRequestQueue.handledCount()} requests`);
    console.info(request.url)
    //console.info(pupResponse)
    counts.success++;
    try {
        const pageUrl = normalizeUrl(request.url, true);

        console.log('------------------------------------------------------------------')
        console.log(`[${request.retryCount}] url: ${displayUrl(pageUrl)}`)
        //console.info(`-> real url: ${displayUrl(pupResponse.url())}`)
        //console.info(`-> response content-type: ${pupResponse.headers()['content-type']}`)
        //console.debug(request.userData)

        const record = handleResponse(request, pupResponse, {
            from: 'onNavigationRequest',
            size: (await pupResponse.buffer()).length,
            body: await pupResponse.text(),
            timing: requestEnd - request.requestStart
        })

        await addRecord(record);

        if (self.homeBasePUrl.matches(pageUrl)) {
            console.log('Page is on website')
            const links = await parseLinksInPage(page);
            links.forEach(async link => {
                try {
                    //const t = await puppeteerRequestQueue.addRequest(link)
                    addToRequestQueue('pup', link)
                } catch (e) {
                    console.error(link)
                    console.error(e)
                    process.exit()
                }
            });

            for (const frame of page.mainFrame().childFrames()) {
                // console.log(frame)

                const links = await parseLinksInPage(frame);

                links.forEach(link => {
                    console.log(`Adding link from iframe <${frame.name()}> ${displayUrl(link.userData.urlData)} (parent:  ${displayUrl(page.url())})`)
                    //puppeteerRequestQueue.addRequest(link)
                    addToRequestQueue('pup', link)
                });

            }

        } else {
            console.log('Page is NOT on website')
        }
    } catch (e) {
        console.error('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=')
        console.error(e);
        throw e;
    }
}