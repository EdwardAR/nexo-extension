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
