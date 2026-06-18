import { fileTypeFromBuffer } from 'file-type'
import { style } from './dropStyle.ts'
import { addEvents, clear, debounce, N } from './ui.ts'
import type { DropInOptions, DropInOutputs } from './types.ts'
import { convert, textDecoder, textEncoder, valid } from './data.ts'

const optionsIn: DropInOptions = {
  parent: document.body,
  url: '',
  autoStart: false,
  showUI: true,
  valid: valid.isNotEmpty,
  result: convert.none,
  placeholderText: 'paste input or drop input file',
  startButtonText: 'start',
  clearButtonText: 'clear',
  pasteButtonText: 'paste',
}

const dropIn = async (options?: Partial<DropInOptions>): Promise<DropInOutputs> =>
  new Promise((resolve) => {
    let inputBuffer: ArrayBuffer
    let overlay: HTMLDivElement
    let inputarea: HTMLTextAreaElement
    let previewarea: HTMLDivElement
    let startButton: HTMLButtonElement

    const config = { ...optionsIn, ...options }

    const createTextInput = async () => <HTMLDivElement>N(
        'div',
        [<HTMLSpanElement>N('span', [
            <HTMLInputElement>addEvents(N('input', undefined, { type: 'file', class: 'fill' }), {
              // @ts-expect-error
              change: (evt) => readFile((evt.target as HTMLInputElement).files),
            }),
            <HTMLButtonElement>(
              addEvents(N('button', config.pasteButtonText), { click: () => paste() })
            ),
            <HTMLButtonElement>(
              addEvents(N('button', config.clearButtonText), { click: () => setTextInput('') })
            ),
          ]), (inputarea = <HTMLTextAreaElement>addEvents(
            N('textarea', undefined, {
              name: 'dropinputarea',
              class: 'inputarea',
              placeholder: config.placeholderText,
              focus: '',
            }),
            {
              input: (evt: Event) => processText((evt.target! as HTMLTextAreaElement).value),
            },
          )), (previewarea = <HTMLDivElement>N('div', undefined, {
            class: 'previewarea hide',
          })), <HTMLSpanElement>N(
            'span',
            (startButton = <HTMLButtonElement>addEvents(
              N('button', config.startButtonText, {
                class: 'action',
                disabled: (await config.valid(textEncoder.encode('').buffer)) ? '' : 'true',
              }),
              {
                click: async () => {
                  config.parent.removeChild(overlay)
                  resolve(await config.result(inputBuffer))
                },
              },
            )),
          )],
        { class: 'dropinput' },
      )

    const createUI = async () => {
      config.parent.appendChild(
        (overlay = <HTMLDivElement>(
          addEvents(N('div', [style, await createTextInput()], { class: 'dropin' }), {
            dragover: (e) => {
              e.preventDefault()
              e.stopPropagation()
              overlay.classList.add('drag')
            },
            dragleave: (e) => {
              e.preventDefault()
              e.stopPropagation()
              overlay.classList.remove('drag')
            },
            drop: async (e: Event) => {
              e.preventDefault()
              e.stopPropagation()
              overlay.classList.remove('drag')
              // @ts-expect-error
              await readFile((e as DragEvent).dataTransfer.files)
            },
          })
        )),
      )
    }

    const processText = debounce(async (text: string) => {
      const buffer = textEncoder.encode(text).buffer
      const isValid = await config.valid(buffer)
      startButton.disabled = !isValid
      if (isValid) inputBuffer = buffer
    })

    const setTextInput = async (text: string) => {
      inputarea.classList.remove('hide')
      previewarea.classList.add('hide')
      inputarea.value = text
      inputarea.select()
    }

    const setPreviewImage = async (buffer: ArrayBuffer) => {
      if (!(await config.valid(buffer))) return
      inputarea.classList.add('hide')
      previewarea.classList.remove('hide')
      const canvas = <HTMLCanvasElement>N('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const img = (await convert.toImage(buffer)) as HTMLImageElement
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(img.src)
      }
      clear(previewarea).appendChild(canvas)
    }

    const setPreviewSVG = async (buffer: ArrayBuffer) => {
      if (!(await config.valid(buffer))) return
      inputarea.classList.add('hide')
      previewarea.classList.remove('hide')
      clear(previewarea).appendChild((await convert.toSVG(buffer)) as SVGSVGElement)
    }

    const setPreview = async (buffer: ArrayBuffer) => {
      if (!(await config.valid(buffer))) return
      inputarea.classList.add('hide')
      previewarea.classList.remove('hide')
      const iframe = <HTMLIFrameElement>N('iframe')
      iframe.src = (await convert.toObjectURL(buffer)) as string
      iframe.onload = () => {
        URL.revokeObjectURL(iframe.src)
      }
      clear(previewarea).appendChild(iframe)
    }

    const handleBuffer = async (buffer: ArrayBuffer) => {
      const isValid = await config.valid(buffer)
      if (isValid) inputBuffer = buffer
      if (config.autoStart && isValid) {
        try {
          config.parent.removeChild(overlay)
        } catch {
          // ignore
        }
        resolve(await config.result(inputBuffer))
      } else {
        if (!overlay) await createUI()
        const mime = (await fileTypeFromBuffer(buffer))?.mime
        if (mime?.startsWith('image/')) {
          await setPreviewImage(buffer)
        } else if (mime === 'application/pdf') {
          await setPreview(buffer)
        } else if (await valid.isText(buffer)) {
          if (await valid.isSVG(buffer)) await setPreviewSVG(buffer)
          else await setTextInput(textDecoder.decode(buffer))
        } else {
          await setPreview(buffer)
        }
        startButton.disabled = !isValid
        startButton.focus()
      }
    }

    const readFile = async (files: File[]) => {
      if (files.length === 1) {
        const file = files[0]
        const reader = new FileReader()
        reader.onload = async (event) => {
          await handleBuffer(event.target!.result as ArrayBuffer)
        }
        reader.onerror = async (e) => {
          await handleBuffer(textEncoder.encode(JSON.stringify(e, null, 2)).buffer)
        }
        reader.readAsArrayBuffer(file)
      } else {
        const msg = '<please drop a single input text file>'
        await handleBuffer(textEncoder.encode(msg).buffer)
      }
    }

    const paste = async () => {
      try {
        const items = await navigator.clipboard.read()
        const blob = await items[0].getType(items[0].types[0])
        const buffer = await blob.arrayBuffer()
        await handleBuffer(buffer)
      } catch (e) {
        await handleBuffer(textEncoder.encode(JSON.stringify(e, null, 2)).buffer)
      }
    }

    if (config.url)
      fetch(config.url)
        .then((response) => (response.ok ? response.arrayBuffer() : new ArrayBuffer()))
        .then(handleBuffer)
        .catch((e) => {
          void handleBuffer(textEncoder.encode(JSON.stringify(e, null, 2)).buffer)
        })
    else void createUI()
  })

export { dropIn }
