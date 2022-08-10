import { console, Report } from '../../core'

export function webScrapingProtection(options = {}) {
    return {
        name: 'web-scraping-protected',
        type: 'atomic',
        options,
        onNavigationResponse: (req, res, page) => {
            if (res.status() === 403 && 'x-datadome' in res.headers()) {
                const domain = (new URL(res.url())).hostname;
                console.debug(domain)
                req.userData.reports.push(
                    new Report('web-scraping-protected', {
                        message: '',
                        data: {
                            domain
                        }
                    })
                )
            }
        }
    }
}