import f from 'filenamify-url'

export function filenamifyUrl(url) {
    return f(url, {
            replacement: '_',
        })
        .replace(/%/g, '_')
        //maxLength: 255 // maxLength is not included yet in filenamify v4.0.0, which is used in current filenamify-url module
        .slice(0, 255)
}