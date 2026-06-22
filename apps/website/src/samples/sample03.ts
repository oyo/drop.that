import { dropIn, DropItem, dropOut, toImage, valid, type DropInOptions } from 'drop.that'
import { toGrayscale } from '../util/img'

const inOpts: Partial<DropInOptions> = {
  url: 'https://raw.githubusercontent.com/oyo/tiny.image.magnifier/refs/heads/main/src/frog.jpg',
  valid: valid.isImage,
  startButtonText: 'grayscale',
}

const downloadResult = async (img: HTMLImageElement) =>
  await dropOut(await DropItem.fromElement(img as HTMLImageElement), {
    download: {
      fileName: 'frog-gray.jpg',
    },
  })

const sample03 = async () => dropIn(inOpts).then(toImage).then(toGrayscale).then(downloadResult)

export { sample03 }
