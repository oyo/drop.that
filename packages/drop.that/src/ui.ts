const nameMap: Record<string, string> = {
  svg: 'http://www.w3.org/2000/svg',
}

export const isJSON = (o: string) => {
  try {
    return JSON.parse(o)
  } catch {
    return false
  }
}

export const json = (o: any) => {
  try {
    return JSON.stringify(o, null, 2)
  } catch (e) {
    return String(e)
  }
}

export const append = (n: Element, c: any) => {
  for (let cn of Array.isArray(c) ? c : [c]) {
    const tc = typeof cn
    try {
      switch (tc) {
        case 'number':
        case 'string':
        case 'boolean':
          n.appendChild(document.createTextNode(cn))
          break
        default:
          if (cn instanceof HTMLElement) n.appendChild(cn)
      }
    } catch {
      const pre = document.createElement('pre')
      pre.appendChild(document.createTextNode(json(cn) ?? String(cn)))
      n.appendChild(pre)
    }
  }
  return n
}

export const N = <T>(tag: string, c?: any, att?: Record<string, string>) => {
  let n = undefined
  if (tag.includes(':')) {
    const [ns, t] = tag.split(':')
    n = document.createElementNS(nameMap[ns], t)
  } else n = document.createElement(tag)
  if (att) for (let a of Object.keys(att)) n.setAttribute(a, att[a])
  if (typeof c === 'undefined' || c === null) return n
  return append(n, c) as T
}

export const remove = (n: Element) => {
  if (!n.parentElement) return
  try {
    n.parentElement.removeChild(n)
  } catch {
    // ignore
  }
  return n
}

export const clear = (n: HTMLElement) => {
  while (n.firstChild) n.removeChild(n.firstChild)
  return n
}

export const addEvents = <T>(n: Element, evts: Record<string, (e: Event) => void>) => {
  Object.keys(evts).forEach((key) => n.addEventListener(key, evts[key]))
  return n as T
}

export const debounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number = 250,
) => {
  let timeoutTimer: ReturnType<typeof setTimeout>

  return (...args: T) => {
    clearTimeout(timeoutTimer)
    timeoutTimer = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}
