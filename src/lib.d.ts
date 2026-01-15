type Validator = (text: string) => boolean

declare const valid: Record<string, Validator>

declare interface DropInOptions {
  parent: HTMLElement
  apiIn: string
  autoStart: boolean
  showUI: boolean
  valid: Validator
  placeholderText: string
  startButtonText: string
  clearButtonText: string
  pasteButtonText: string
}

declare interface DropOutOptions {
  parent: HTMLElement
  apiMethod: string
  apiOut: string
	apiOutMimeType: string
  autoDownload: boolean
  autoCopy: boolean
  copyButtonText: string
  downloadButtonText: string
  downloadFileName: string
  downloadFileMimeType: string
	uploadButtonText: string
  rawButtonText: string
	previewButtonText: string
}

declare function dropIn(options?: Partial<DropInOptions>): Promise<string>
declare function dropOut(output: string, options?: Partial<DropOutOptions>): Promise<void>

export { dropIn, dropOut, valid, type Validator }
