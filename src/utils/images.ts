export function resolveImageSrc(src?: string): string | undefined {
  if (!src) return undefined
  // absolute urls
  if (/^https?:\/\//i.test(src)) return src
  // `./` should map to public root - remove the leading dot
  if (/^\.\//.test(src)) return src.replace(/^\./, '')
  // if it already looks like an absolute path /assets/foo.png
  if (/^\//.test(src)) return src
  // fallback: return as-is (could be relative path already)
  return src
}
