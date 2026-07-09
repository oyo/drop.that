import { dropIn, dropOut, fromElement, toImage, valid } from 'drop.that'
import { toGrayscale } from '../util/util.ts'

const inOptions = {
  url: 'https://raw.githubusercontent.com/oyo/tiny.image.magnifier/refs/heads/main/src/frog.jpg',
  valid: valid.isImage,
  startButtonText: 'grayscale',
}

const process = () =>
  dropIn(inOptions).then(toImage).then(toGrayscale).then(fromElement).then(dropOut)

export default {
  label: 'Convert image to grayscale',
  process,
}
