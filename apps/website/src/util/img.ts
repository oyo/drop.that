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

export { toGrayscale }
