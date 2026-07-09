import { dropIn, dropOut, fromText, toBuffer, valid } from 'drop.that'
import { PDFParse, type LoadParameters } from 'pdf-parse'

PDFParse.setWorker(
  'https://cdn.jsdelivr.net/npm/pdf-parse@latest/dist/pdf-parse/web/pdf.worker.mjs',
)

const extractText = async (data: ArrayBuffer) => {
  const parser = new PDFParse(data as LoadParameters)
  const result = await parser.getText()
  await parser.destroy()
  return result.text
}

const inOptions = {
  url: 'https://raw.githubusercontent.com/mehmet-kozan/pdf-parse/refs/heads/main/reports/pdf/bitcoin.pdf',
  valid: valid.isPDF,
  startButtonText: 'extract',
}

const process = () =>
  dropIn(inOptions).then(toBuffer).then(extractText).then(fromText).then(dropOut)

export default {
  label: 'Extract text from PDF',
  process,
}
