export function displayUrl(url) {
  if (!url) {
    return url;
  }
  return url.startsWith('data:') ? `${url.slice(0, 60)}...` : url;
}