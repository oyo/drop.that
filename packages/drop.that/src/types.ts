type DropInOutputs = ArrayBuffer | string | Blob | HTMLImageElement | SVGSVGElement
type Validator = (data: ArrayBuffer) => Promise<boolean>
type Converter = (data: ArrayBuffer) => Promise<DropInOutputs>

interface DropInOptions {
  parent: HTMLElement
  url: string
  autoStart: boolean
  showUI: boolean
  valid: Validator
  result: Converter
  placeholderText: string
  startButtonText: string
  clearButtonText: string
  pasteButtonText: string
}

export type { Converter, DropInOptions, DropInOutputs, Validator }
