export function getOptimizedImageUrl(url: string): string {
  if (url.startsWith('/images/') && url.endsWith('.jpg')) {
    return `${url.slice(0, -4)}.webp`;
  }
  return url;
}
