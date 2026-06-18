import { fileTypeFromBuffer } from 'file-type'
import type { Converter, Validator } from './types.ts'
import { N } from './ui.ts'

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const valid: Record<string, Validator> = {
  isNotEmpty: async (v: ArrayBuffer) => v.byteLength > 0,
  isBinary: async (v: ArrayBuffer) => v.byteLength > 0 && new Uint8Array(v).includes(0),
  isText: async (v: ArrayBuffer) => v.byteLength > 0 && !(await valid.isBinary(v)),
  isJSON: async (v: ArrayBuffer) => {
    const isText = await valid.isText(v)
    if (!isText) return false
    try {
      JSON.parse(textDecoder.decode(v))
      return true
    } catch {
      return false
    }
  },
  isImage: async (v: ArrayBuffer) =>
    (await fileTypeFromBuffer(v))?.mime.startsWith('image') ? true : false,
  isPDF: async (v: ArrayBuffer) =>
    (await fileTypeFromBuffer(v))?.mime === 'application/pdf' ? true : false,
  isSVG: async (v: ArrayBuffer) =>
    (await valid.isText(v)) && /^\s*<svg\s+/.test(textDecoder.decode(v)),
}

const convert: Record<string, Converter> = {
  none: async (v: ArrayBuffer) => v,
  toText: async (v: ArrayBuffer) => textDecoder.decode(v),
  toBlob: async (v: ArrayBuffer) => new Blob([v], { type: (await fileTypeFromBuffer(v))?.mime }),
  toDataURI: async (v: ArrayBuffer) =>
    `data:${(await fileTypeFromBuffer(v))?.mime};base64,${btoa(String.fromCharCode(...new Uint8Array(v)))}`,
  toObjectURL: async (v: ArrayBuffer) => URL.createObjectURL((await convert.toBlob(v)) as Blob),
  toImage: async (v: ArrayBuffer) => {
    const img = new Image()
    img.src = (await convert.toObjectURL(v)) as string
    return img
  },
  toSVG: async (v: ArrayBuffer) => {
    const div = <HTMLDivElement>N('div')
    div.innerHTML = (await convert.toText(v)) as string
    return div.firstChild as SVGSVGElement
  },
}

export { convert, valid, textDecoder, textEncoder }
