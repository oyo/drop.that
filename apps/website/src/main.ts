import { convert, dropIn, valid } from 'drop.that'
//import { PDFParse } from 'pdf-parse'

//const processAny = async () => {
//  const input = await dropIn()
//  document.body.appendChild(document.createTextNode(input.toString()))
//}

//const processText = async () => {
//  const split = (
//    (await dropIn({
//      url: 'https://raw.githubusercontent.com/oyo/drop.that/refs/heads/main/LICENSE',
//      valid: valid.isText,
//      result: convert.toText,
//      autoStart: true,
//    })) as string
//  ).replace(/\s+/g, '\n')
//  const pre = document.createElement('pre')
//  pre.appendChild(document.createTextNode(split))
//  document.body.appendChild(pre)
//}

const processImage = async () => {
  const img = (await dropIn({
    url: 'https://raw.githubusercontent.com/oyo/tiny.image.magnifier/refs/heads/main/src/frog.jpg',
    valid: valid.isImage,
    result: convert.toImage,
  })) as HTMLImageElement
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  document.body.appendChild(canvas)
  img.addEventListener('load', () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.filter = 'grayscale(1)'
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(img.src)
  })
}

//const processPDF = async () => {
//  const input = (await dropIn({
//    url: 'https://raw.githubusercontent.com/mehmet-kozan/pdf-parse/2edcaf1015446b5962e64e46b2dea1c23d1f19ca/reports/pdf/bitcoin.pdf',
//    valid: valid.isPDF,
//  })) as ArrayBuffer
//  PDFParse.setWorker(
//    'https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs',
//  )
//  const parser = new PDFParse({ data: input })
//  const text = await parser.getText()
//  await parser.destroy()
//  const pre = document.createElement('pre')
//  pre.appendChild(document.createTextNode(text.text))
//  document.body.appendChild(pre)
//}

await processImage()
