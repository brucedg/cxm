import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'

const window = new JSDOM('').window
const purify = DOMPurify(window as any)

// Only allow safe SVG elements and attributes
purify.setConfig({
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ['svg'],
  ADD_ATTR: ['viewBox', 'xmlns', 'fill', 'd', 'transform', 'opacity', 'fill-rule', 'clip-rule', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points', 'offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'gradientTransform', 'patternUnits', 'patternTransform'],
  FORBID_TAGS: ['script', 'style', 'foreignObject', 'use', 'image', 'animate', 'set', 'animateTransform', 'animateMotion'],
  FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'xlink:href', 'href', 'src', 'data-*'],
  ALLOW_DATA_ATTR: false,
})

export function sanitizeSvg(input: string): string {
  if (!input || !input.trim()) return ''

  // Must contain an svg tag
  if (!/<svg[\s>]/i.test(input)) return ''

  const clean = purify.sanitize(input, { RETURN_DOM: false }) as string

  // Verify result still has an svg tag
  if (!/<svg[\s>]/i.test(clean)) return ''

  return clean.trim()
}
