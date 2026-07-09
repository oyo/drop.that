import { style } from './dropStyle.ts'
import { addEvents, clear, N } from './ui.ts'
import type {
  DropOutClipboardOptions,
  DropOutDownloadOptions,
  DropOutOptions,
  DropOutOptionsFull,
  DropOutSubmitOptions,
} from './types.ts'
import { DropItem } from './data.ts'

const optionsSubmit: DropOutSubmitOptions = {
  enable: false,
  auto: false,
  method: 'POST',
  url: '',
  mimeType: 'text/plain',
  buttonText: 'submit',
}

const optionsDownload: DropOutDownloadOptions = {
  enable: true,
  auto: false,
  fileName: 'drop.that',
  mimeType: 'text/plain',
  buttonText: 'download',
}

const optionsClipboard: DropOutClipboardOptions = {
  enable: true,
  auto: false,
  mimeType: 'text/plain',
  buttonText: 'copy',
}

const optionsOut: DropOutOptionsFull = {
  parent: document.body,
  allowClose: true,
  submit: optionsSubmit,
  download: optionsDownload,
  clipboard: optionsClipboard,
}

const dropOut = async (output: DropItem, options?: Partial<DropOutOptions>) => {
  let overlay: HTMLDivElement
  let viewswitch: HTMLDivElement
  let textarea: HTMLTextAreaElement = <HTMLTextAreaElement>N('textarea')
  let previewarea: HTMLDivElement = <HTMLDivElement>N('div')
  let closeListener: (e: Event) => void

  const config: DropOutOptionsFull = {
    parent: options?.parent ?? optionsOut.parent,
    allowClose: true,
    submit: { ...optionsOut.submit, ...options?.submit },
    download: { ...optionsOut.download, ...options?.download },
    clipboard: { ...optionsOut.clipboard, ...options?.clipboard },
  }

  const createTextInput = async () => <HTMLDivElement>N(
      'div',
      [
        <HTMLSpanElement>(
          N(
            'span',
            [
              <HTMLSpanElement>N('span', undefined, { class: 'fill' }),
              <HTMLButtonElement>(
                addEvents(N('button', 'preview'), { click: () => show(previewarea) })
              ),
              <HTMLButtonElement>addEvents(N('button', 'text'), { click: () => show(textarea) }),
            ],
            { class: 'inputactions' },
          )
        ),
        (viewswitch = <HTMLDivElement>N(
          'div',
          (textarea = <HTMLTextAreaElement>N('textarea', undefined, {
            name: 'dropoutputarea',
            disabled: '',
            class: 'textarea',
          })),
          { class: 'viewswitch' },
        )),
        <HTMLSpanElement>N('span', [...(config.submit.enable ? [<HTMLButtonElement>addEvents(
                  N('button', config.submit.buttonText, {
                    class: 'action',
                  }),
                  {
                    click: handleSubmit,
                  },
                )] : []), ...(config.download.enable ? [<HTMLButtonElement>addEvents(
                  N('button', config.download.buttonText, {
                    class: 'action',
                  }),
                  {
                    click: handleDownload,
                  },
                )] : []), ...(config.clipboard.enable ? [<HTMLButtonElement>addEvents(
                  N('button', config.clipboard.buttonText, {
                    class: 'action',
                  }),
                  {
                    click: handleClipboard,
                  },
                )] : [])]),
      ],
      { class: 'dropoutput' },
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
      (overlay = <HTMLDivElement>N(
        'div',
        [
          style,
          ...(config.allowClose
            ? [
                addEvents(N('button', '✕', { class: 'dropclose' }), {
                  click: close,
                }),
              ]
            : []),
          await createTextInput(),
        ],
        { class: 'dropout' },
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

  const setTextOutput = async (text: string) => {
    show(textarea)
    textarea.value = text
    textarea.select()
  }

  const setPreview = async (element: Element) => {
    show(previewarea)
    clear(previewarea).appendChild(element)
  }

  const handleSubmit = async () => {
    console.log(`submit to ${config.submit.method} ${config.submit.url}`)
    await fetch(config.submit.url, {
      method: config.submit.method,
      body: output.data,
      headers: {
        'content-type': output.type.mime,
      },
    })
  }

  const handleDownload = async () => {
    const fileName = config.download.fileName.endsWith(output.type.ext)
      ? config.download.fileName
      : `${config.download.fileName}.${output.type.ext}`
    console.log(`download ${fileName}`)
    const link = document.createElement('a')
    const url = URL.createObjectURL(
      new File([output.data], fileName, {
        type: output.type.mime,
      }),
    )
    link.href = url
    link.download = fileName
    config.parent.appendChild(link)
    link.click()
    config.parent.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleClipboard = async () => {
    console.log(`try copy to ${output.type.mime} clipboard`)
    try {
      const item = new ClipboardItem({
        [output.type.mime]: await output.blob(),
      })
      await navigator.clipboard.write([item])
    } catch (err) {
      console.log(err)
      void setTextOutput(`Can't copy ${output.type.mime} to clipboard.
Browser restricted mime type to:

- text/plain
- text/html
- image/png`)
    }
  }

  const showOutput = async () => {
    switch (output.type.mime) {
      case 'text/plain':
      case 'application/json':
        void setTextOutput(await output.text())
        break
      case 'image/svg+xml':
        await setPreview(await output.svg())
        break
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        await setPreview(await output.image())
        break
      default:
        await setPreview(await output.iframe())
    }
  }
  await createUI()
  await showOutput()
  if (config.clipboard.auto) await handleClipboard()
  if (config.download.auto) await handleDownload()
  if (config.submit.auto) await handleSubmit()
}

export { dropOut }
