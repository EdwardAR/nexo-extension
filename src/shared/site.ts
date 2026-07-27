export function getHostname(site: string) {
  try {
    return new URL(/^https?:\/\//i.test(site) ? site : `https://${site}`).hostname
      .toLowerCase()
      .replace(/^www\./, '')
  } catch {
    return site
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      .toLowerCase()
      .replace(/^www\./, '')
  }
}

export function getFaviconUrl(site: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(getHostname(site))}&sz=64`
}
