import { FailedToLaunchError, HttpError, BrowserHasDisconnectedError, MailError, NetError, CorveeError, PageCrashedError, TimeoutError, TargetClosedError, UrlError } from './definitions'
import { console, inspect } from '../../../core'

export function captureErrors(data) {
    if (!Array.isArray(data)) {
        data = [data];
    }
    return data.map(captureError).filter(err => err.name !== 'AbortedError');
}

export function captureError(error) {

    if (typeof error === 'string') {
        console.todo('THIS SHOULD NOT HAPPEND: typeof error === \'string\'', error)

        //
        // Puppeteer / crawler errors
        //
        if (error.indexOf('Error: Failed to launch chrome!') > 0) {
            const failedToLaunchError = new FailedToLaunchError('Failed to launch chrome.')

            failedToLaunchError._from = 'Puppeteer / crawler errors'

            return failedToLaunchError
        }

        if (
            error.indexOf('PuppeteerPool: browser.newPage() timed out') > 0
            || error.indexOf('PuppeteerCrawler: handlePageFunction timed out after') > 0
            || error.indexOf('TimedOutError: Harvester timed out.') > 0
        ) {
            const timedOutError = new TimeoutError('Harvester timed out.')

            timedOutError._from = 'Puppeteer / crawler errors (STRING)'

            return timedOutError
        }
    }

    if (typeof error === 'object') {

        //
        // Chromium Net error
        //
        if ('message' in error && /net::ERR_([^ ]+)/i.test(error.message)) {

            const netError = new NetError(error.message);
            netError._from = "/net::ERR_([^ ]+)/i.test(error) (OBJECT)"

            return netError
        }

        //
        // CorveeError class
        //
        if (error instanceof CorveeError) {
            return error;
        }

        // HttpError class
        if (error instanceof HttpError) {

            error._from = 'error instanceof HttpError'

            return error
        }

        //
        // MailError class
        //
        if (error instanceof MailError) {

            error._from = 'error instanceof MailError'

            return error
        }

        //
        // Puppeteer TimeoutError class
        //
        if (error.constructor.name === 'TimeoutError') {

            error = new TimeoutError(error.message)

            error._from = 'error.constructor.name === \'TimeoutError\''

            return error
        }

        //
        // Puppeteer Error class errors
        //
        if (error.constructor.name === 'Error') {
            if (error.message === 'Page crashed!') {

                const pageCrashedError = new PageCrashedError(error.message)

                pageCrashedError._from = 'Puppeteer / crawler errors (OBJECT)'

                return pageCrashedError
            }

            if (error.message.startsWith('PuppeteerCrawler: handlePageFunction timed out after')
                || error.message.indexOf('Navigation Timeout Exceeded:') > -1) {
                const timeoutError = new TimeoutError(error.message)

                timeoutError._from = 'Puppeteer / crawler errors (OBJECT)'

                return timeoutError
            }

            if (error.message === 'Navigation failed because browser has disconnected!') {
                const browserHasDisconnectedError = new BrowserHasDisconnectedError(error.message)

                browserHasDisconnectedError._from = 'Puppeteer / crawler errors (OBJECT)'

                return browserHasDisconnectedError
            }

            if (error.message === 'Protocol error (Runtime.addBinding): Target closed.') {
                const targetClosedError = new TargetClosedError(error.message)

                targetClosedError._from = 'Puppeteer / crawler errors (OBJECT)'

                return targetClosedError
            }
        }

        //
        // UrlError class
        //
        if (error instanceof UrlError) {

            error._from = 'error instanceof UrlError'

            return error
        }
    }

    //
    // Unhandled errors
    //
    return {
        level: 'info',
        code: 'unhandled-error',
        _fixme: true,
        _from: 'unhandledError',
        _original: error,
    }
}