import { FileTypeParser } from 'file-type'
import { detectXml } from '@file-type/xml'
import Papa from 'papaparse'
import type { DropOutInputs, Exporter, Importer, Validator } from './types.ts'
import { N } from './ui.ts'

type FileType = {
  mime: string
  ext: string
}

const ftype: Record<string, FileType> = {
  bin: { mime: 'application/octet-stream', ext: 'bin' },
  text: { mime: 'text/plain', ext: 'txt' },
  json: { mime: 'application/json', ext: 'json' },
  csv: { mime: 'text/csv', ext: 'csv' },
}

const ftParser = new FileTypeParser({ customDetectors: [detectXml] })

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const getFileType = async (v: ArrayBuffer): Promise<FileType> => {
  const type = await ftParser.fromBuffer(v)
  if (type && type.mime) return type
  if (await valid.isBinary(v)) return ftype.bin
  if (await valid.isJSON(v)) return ftype.json
  if (await valid.isCSV(v)) return ftype.csv
  return ftype.text
}

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
  isCSV: (v: ArrayBuffer): Promise<boolean> =>
    new Promise((resolve) => {
      Papa.parse(textDecoder.decode(v), {
        complete: (results) => resolve(results.errors.length === 0),
      })
    }),
  isImage: async (v: ArrayBuffer) => (await getFileType(v)).mime.startsWith('image'),
  isPDF: async (v: ArrayBuffer) => (await getFileType(v)).mime === 'application/pdf',
  isSVG: async (v: ArrayBuffer) => (await getFileType(v)).mime === 'image/svg+xml',
}

const createDOMObject = async (tag: string, v: ArrayBuffer) =>
  N(tag, undefined, { src: (await exp.toObjectURL(v)) as string })

const exp: Record<string, Exporter> = {
  none: async (v: ArrayBuffer) => v,
  toText: async (v: ArrayBuffer) => textDecoder.decode(v),
  toJSON: async (v: ArrayBuffer) => JSON.parse(textDecoder.decode(v)),
  toBlob: async (v: ArrayBuffer) => new Blob([v], { type: (await getFileType(v)).mime }),
  toDataURI: async (v: ArrayBuffer) =>
    `data:${(await getFileType(v)).mime};base64,${btoa(String.fromCharCode(...new Uint8Array(v)))}`,
  toObjectURL: async (v: ArrayBuffer) => URL.createObjectURL((await exp.toBlob(v)) as Blob),
  toImage: async (v: ArrayBuffer) => (await createDOMObject('img', v)) as HTMLImageElement,
  toIframe: async (v: ArrayBuffer) => (await createDOMObject('iframe', v)) as HTMLIFrameElement,
  toSVG: async (v: ArrayBuffer) => {
    const div = <HTMLDivElement>N('div')
    div.innerHTML = (await exp.toText(v)) as string
    return div.firstChild as SVGSVGElement
  },
}

const imp: Record<string, Importer> = {
  fromBuffer: async (v: DropOutInputs) => v as ArrayBuffer,
  fromText: async (v: DropOutInputs) => textEncoder.encode(v as string).buffer,
  fromJSON: async (v: DropOutInputs) => imp.fromText(JSON.stringify(v as JSON)),
  fromBlob: async (v: DropOutInputs) => (v as Blob).arrayBuffer(),
  fromURL: async (v: DropOutInputs) => await (await fetch(v as string)).arrayBuffer(),
  fromElement: async (v: DropOutInputs) => await imp.fromURL((v as HTMLImageElement).src),
  fromSVG: async (v: DropOutInputs) => await imp.fromText((v as SVGSVGElement).outerHTML),
}

class DropItem {
  public data: ArrayBuffer = new ArrayBuffer()
  public type: FileType = ftype.text

  constructor() {}

  async setData(data: ArrayBuffer, type?: FileType) {
    this.data = data
    this.type = type ?? (await getFileType(data))
    return this
  }

  static async fromBuffer(buffer: ArrayBuffer) {
    return await new DropItem().setData(buffer)
  }
  static async fromText(text: string) {
    return await new DropItem().setData(await imp.fromText(text))
  }
  static async fromJSON(json: JSON) {
    return await new DropItem().setData(await imp.fromJSON(json), ftype.json)
  }
  static async fromBlob(blob: Blob) {
    return await new DropItem().setData(await imp.fromBlob(blob), { mime: blob.type, ext: 'blob' })
  }
  static async fromURL(url: string) {
    return await new DropItem().setData(await imp.fromURL(url))
  }
  static async fromElement(element: HTMLImageElement | HTMLIFrameElement) {
    return await new DropItem().setData(await imp.fromElement(element))
  }
  static async fromSVG(svg: SVGSVGElement) {
    return await new DropItem().setData(await imp.fromSVG(svg))
  }

  async isNotEmpty() {
    return await valid.isNotEmpty(this.data)
  }
  async isBinary() {
    return await valid.isBinary(this.data)
  }
  async isText() {
    return await valid.isText(this.data)
  }
  async isJSON() {
    return await valid.isJSON(this.data)
  }
  async isImage() {
    return this.type.mime.startsWith('image/')
  }
  async isPDF() {
    return this.type.mime === 'application/pdf'
  }
  async isSVG() {
    return this.type.mime === 'image/svg+xml'
  }

  async buffer() {
    return this.data
  }
  async text() {
    return (await exp.toText(this.data)) as string
  }
  async json() {
    return (await exp.toJSON(this.data)) as JSON
  }
  async blob() {
    return (await exp.toBlob(this.data)) as Blob
  }
  async dataURI() {
    return (await exp.toDataURI(this.data)) as string
  }
  async objectURL() {
    return (await exp.toObjectURL(this.data)) as string
  }
  async image() {
    return (await exp.toImage(this.data)) as HTMLImageElement
  }
  async svg() {
    return (await exp.toSVG(this.data)) as SVGSVGElement
  }
  async iframe() {
    return (await exp.toIframe(this.data)) as HTMLIFrameElement
  }
}

const toBuffer = async (input: DropItem) => input.buffer()
const toText = async (input: DropItem) => input.text()
const toJSON = async (input: DropItem) => input.json()
const toBlob = async (input: DropItem) => input.blob()
const toDataURI = async (input: DropItem) => input.dataURI()
const toObjectURL = async (input: DropItem) => input.objectURL()
const toImage = async (input: DropItem) => input.image()
const toIframe = async (input: DropItem) => input.iframe()
const toSVG = async (input: DropItem) => input.svg()

const fromBuffer = async (v: ArrayBuffer) => await DropItem.fromBuffer(v)
const fromText = async (v: string) => await DropItem.fromText(v)
const fromJSON = async (v: JSON) => await DropItem.fromJSON(v)
const fromBlob = async (v: Blob) => await DropItem.fromBlob(v)
const fromURL = async (v: string) => await DropItem.fromURL(v)
const fromElement = async (v: HTMLImageElement | HTMLIFrameElement) => await DropItem.fromElement(v)
const fromSVG = async (v: SVGSVGElement) => await DropItem.fromSVG(v)

export {
  exp,
  valid,
  textDecoder,
  textEncoder,
  fromBuffer,
  fromText,
  fromJSON,
  fromBlob,
  fromURL,
  fromElement,
  fromSVG,
  toBuffer,
  toText,
  toJSON,
  toBlob,
  toDataURI,
  toObjectURL,
  toImage,
  toIframe,
  toSVG,
  DropItem,
}
