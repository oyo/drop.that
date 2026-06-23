import { expect, test } from 'vite-plus/test'
import { exp, textEncoder, valid } from '../src/data.ts'

const samples = {
  empty: new ArrayBuffer(),
  text: textEncoder.encode('hello drop.that!').buffer,
  utf: textEncoder.encode('⻰ด').buffer,
  json: textEncoder.encode('{"name":"drop","values":["that",-1]}').buffer,
  csv: textEncoder.encode('id,name,value\n1,foo,23\n2,bar,42\n').buffer,
  svg: textEncoder.encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>').buffer,
  pdf: textEncoder.encode(`%PDF-2.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 9 9]>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000101 00000 n 
trailer<</Root 1 0 R/Size 4/ID[(1234567890123456)(1234567890123456)]>>
startxref
174
%%EOF`).buffer,
}

test('valid', async () => {
  expect(await valid.isNotEmpty(samples.empty)).toBe(false)
  expect(await valid.isText(samples.empty)).toBe(false)
  expect(await valid.isBinary(samples.empty)).toBe(false)
  expect(await valid.isNotEmpty(samples.text)).toBe(true)
  expect(await valid.isText(samples.text)).toBe(true)
  expect(await valid.isBinary(samples.text)).toBe(false)
  expect(await valid.isText(samples.utf)).toBe(true)
  expect(await valid.isJSON(samples.text)).toBe(false)
  expect(await valid.isJSON(samples.json)).toBe(true)
  expect(await valid.isSVG(samples.json)).toBe(false)
  expect(await valid.isText(samples.csv)).toBe(true)
  expect(await valid.isCSV(samples.csv)).toBe(true)
  expect(await valid.isText(samples.svg)).toBe(true)
  expect(await valid.isSVG(samples.svg)).toBe(true)
  expect(await valid.isPDF(samples.pdf)).toBe(true)
})

test('exp', async () => {
  expect(await exp.toJSON(samples.json)).toEqual({ name: 'drop', values: ['that', -1] })
  expect(await exp.toSVG(samples.svg)).toBeInstanceOf(SVGSVGElement)
})
