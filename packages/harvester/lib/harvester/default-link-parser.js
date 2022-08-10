export function defaultLinkParser() {
  return Array
    .from(document.querySelectorAll('a[href]'))
    .map(link => ({
      url: link.href,
      text: link.innerText,
      urlData: link.getAttribute('href'),
      isNavigationRequest: true
    }))
}