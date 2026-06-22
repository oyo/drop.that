import { fileTypeFromBuffer } from 'file-type'
import { style } from './dropStyle.ts'
import { addEvents, clear, debounce, N } from './ui.ts'
import { type DropInOptions } from './types.ts'
import { exp, DropItem, textDecoder, textEncoder, valid } from './data.ts'

const optionsIn: DropInOptions = {
  parent: document.body,
  url: '',
  autoStart: false,
  showUI: true,
  valid: valid.isNotEmpty,
  placeholderText: 'paste input or drop input file',
  startButtonText: 'start',
  clearButtonText: 'clear',
  pasteButtonText: 'paste',
}

const dropIn = async (options?: Partial<DropInOptions>): Promise<DropItem> =>
  new Promise((resolve) => {
    let result = new DropItem()
    let overlay: HTMLDivElement
    let viewswitch: HTMLDivElement
    let textarea: HTMLTextAreaElement
    let previewarea: HTMLDivElement
    let startButton: HTMLButtonElement
    let closeListener: (e: Event) => void

    const config = { ...optionsIn, ...options }

    const createTextInput = async () => <HTMLDivElement>N(
        'div',
        [<HTMLSpanElement>N(
            'span',
            [
              <HTMLInputElement>(
                addEvents(N('input', undefined, { value: 'file', type: 'file', class: 'fill' }), {
                  change: (evt) => readFile((evt.target as HTMLInputElement).files),
                })
              ),
              <HTMLButtonElement>(
                addEvents(N('button', config.pasteButtonText), { click: () => paste() })
              ),
              <HTMLButtonElement>addEvents(N('button', config.clearButtonText), {
                click: async () => {
                  clear(previewarea)
                  await setTextInput('')
                  await handleBuffer(new ArrayBuffer())
                },
              }),
            ],
            { class: 'inputactions' },
          ), (viewswitch = <HTMLDivElement>N(
            'div',
            (textarea = <HTMLTextAreaElement>addEvents(
              N('textarea', undefined, {
                name: 'dropinputarea',
                class: 'textarea',
                placeholder: config.placeholderText,
                focus: '',
              }),
              {
                input: (evt: Event) => processText((evt.target! as HTMLTextAreaElement).value),
              },
            )),
            { class: 'viewswitch' },
          )), <HTMLSpanElement>N(
            'span',
            (startButton = <HTMLButtonElement>addEvents(
              N('button', config.startButtonText, {
                class: 'action',
                disabled: (await config.valid(textEncoder.encode('').buffer)) ? '' : 'true',
              }),
              {
                click: async () => {
                  close()
                  resolve(result)
                },
              },
            )),
          )],
        { class: 'dropinput' },
      )

    const createUI = async () => {
      document.body.addEventListener(
        'keydown',
        (closeListener = (e: Event) => {
          if ((e as KeyboardEvent).code === 'Escape') close()
        }),
      )
      previewarea = <HTMLDivElement>N('div', undefined, {
        class: 'previewarea',
      })
      config.parent.appendChild(
        (overlay = <HTMLDivElement>addEvents(
          N(
            'div',
            [
              style,
              addEvents(N('button', '✕', { class: 'dropclose' }), {
                click: close,
              }),
              await createTextInput(),
            ],
            { class: 'dropin' },
          ),
          {
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
          },
        )),
      )
    }

    const show = (element: HTMLElement) => {
      clear(viewswitch)
      viewswitch.appendChild(element)
    }

    const close = () => {
      try {
        config.parent.removeChild(overlay)
        document.body.removeEventListener('keydown', closeListener)
      } catch {
        // ignore
      }
    }

    const processText = debounce(async (text: string) => {
      const buffer = textEncoder.encode(text).buffer
      const isValid = await config.valid(buffer)
      startButton.disabled = !isValid
      if (isValid) await result.setData(buffer)
    })

    const setTextInput = async (text: string) => {
      show(textarea)
      textarea.value = text
      textarea.select()
    }

    const setPreviewImage = async (buffer: ArrayBuffer) => {
      if (!(await config.valid(buffer))) return
      show(previewarea)
      const img = (await exp.toImage(buffer)) as HTMLImageElement
      clear(previewarea).appendChild(img)
    }

    const setPreviewSVG = async (buffer: ArrayBuffer) => {
      if (!(await config.valid(buffer))) return
      show(previewarea)
      clear(previewarea).appendChild((await exp.toSVG(buffer)) as SVGSVGElement)
    }

    const setPreview = async (buffer: ArrayBuffer) => {
      if (!(await config.valid(buffer))) return
      show(previewarea)
      clear(previewarea).appendChild((await exp.toIframe(buffer)) as HTMLIFrameElement)
    }

    const handleBuffer = async (buffer: ArrayBuffer) => {
      const isValid = await config.valid(buffer)
      if (isValid) await result.setData(buffer)
      if (config.autoStart && isValid) {
        close()
        resolve(result)
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

    const handleError = async (e: unknown) =>
      await handleBuffer(textEncoder.encode(JSON.stringify(e, null, 2)).buffer)

    const readFile = async (filelist: FileList | null) => {
      if (!filelist) return
      if (filelist.length !== 1) {
        show(textarea)
        await setTextInput('<please drop a single input file>')
        return
      }
      try {
        await handleBuffer((await filelist.item(0)?.arrayBuffer()) ?? new ArrayBuffer())
      } catch (e) {
        await handleError(e)
      }
    }

    const paste = async () => {
      try {
        const items = await navigator.clipboard.read()
        if (items.length !== 1) {
          show(textarea)
          await setTextInput('<please paste a single input item>')
          return
        }
        const blob = await items[0].getType(items[0].types[0])
        const buffer = await blob.arrayBuffer()
        await handleBuffer(buffer)
      } catch (e) {
        await handleError(e)
      }
    }

    if (config.url)
      fetch(config.url)
        .then((response) => response.arrayBuffer())
        .then(handleBuffer)
        .catch(handleError)
    else void createUI()
  })

export { dropIn }
