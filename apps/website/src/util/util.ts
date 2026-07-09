const getMimeType = async (objectUrl: string) => {
  try {
    const response = await fetch(objectUrl)
    const blob = await response.blob()
    return blob.type
  } catch {
    return 'image/png'
  }
}

const toGrayscale = async (img: HTMLImageElement): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    img.addEventListener('load', async () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.filter = 'grayscale(1)'
      ctx.drawImage(img, 0, 0)
      const gray = new Image()
      gray.src = canvas.toDataURL(await getMimeType(img.src))
      resolve(gray)
    })
  })

type WordList = Array<[string, number]>

const wordCount = (input: string) =>
  (
    Object.entries(
      input
        .toLocaleLowerCase()
        .replace(/[^a-z ]/g, '')
        .replace(/[ ]+/g, ' ')
        .trim()
        .split(' ')
        .reduce((a, c) => (a[c] ? a[c]++ : (a[c] = 1), a), {} as Record<string, number>),
    ) as WordList
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

const wordGraph = (count: WordList) =>
  new DOMParser().parseFromString(
    `<svg viewBox="0 0 100 70" width="800" height="560">
<defs><style>
.b{fill:none;stroke:#0000ff;stroke-width:4;}
.n{fill:black;font-size:2px;font-family:sans-serif;dominant-baseline:middle;text-align:right;}
.w{fill:white;font-size:2px;font-family:sans-serif;dominant-baseline:middle;}
</style></defs>
<g>
<path class="b" d="${count.map(([_, n], i) => `M 20 ${(i + 2) * 5} l ${n} 0`).join()}" />
${count
  .map(
    ([w, n], i) =>
      `<text class="n" x="15" y="${(i + 2) * 5}">${n}</text>
<text class="w" x="22" y="${(i + 2) * 5}">${w}</text>`,
  )
  .join('\n')}
</g></svg>`,
    'image/svg+xml',
  ).firstChild as SVGSVGElement

export { toGrayscale, wordCount, wordGraph }
