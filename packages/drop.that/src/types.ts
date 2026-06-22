type DropInOutputs =
  | ArrayBuffer
  | string
  | JSON
  | Blob
  | HTMLImageElement
  | SVGSVGElement
  | HTMLIFrameElement

type DropOutInputs = DropInOutputs

type Validator = (data: ArrayBuffer) => Promise<boolean>
type Exporter = (data: ArrayBuffer) => Promise<DropInOutputs>
type Importer = (data: DropOutInputs) => Promise<ArrayBuffer>

interface DropInOptions {
  parent: HTMLElement
  url: string
  autoStart: boolean
  showUI: boolean
  valid: Validator
  placeholderText: string
  startButtonText: string
  clearButtonText: string
  pasteButtonText: string
}

interface DropOutSubmitOptions {
  enable: boolean
  auto: boolean
  method: string
  url: string
  mimeType: string
  buttonText: string
}

interface DropOutDownloadOptions {
  enable: boolean
  auto: boolean
  fileName: string
  mimeType: string
  buttonText: string
}

interface DropOutClipboardOptions {
  enable: boolean
  auto: boolean
  mimeType: string
  buttonText: string
}

interface DropOutOptions {
  parent: HTMLElement
  submit: Partial<DropOutSubmitOptions>
  download: Partial<DropOutDownloadOptions>
  clipboard: Partial<DropOutClipboardOptions>
}

interface DropOutOptionsFull {
  parent: HTMLElement
  submit: DropOutSubmitOptions
  download: DropOutDownloadOptions
  clipboard: DropOutClipboardOptions
}

type DropOutResult = {
  errors?: Record<string, unknown>
}

export type {
  Exporter,
  Importer,
  DropOutClipboardOptions,
  DropOutDownloadOptions,
  DropOutSubmitOptions,
  DropInOptions,
  DropOutOptions,
  DropOutOptionsFull,
  DropOutInputs,
  DropOutResult,
  Validator,
}
