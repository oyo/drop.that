import { dropIn, valid } from 'drop.that'

const sample02 = async () =>
  await dropIn({
    url: 'https://raw.githubusercontent.com/oyo/tiny.image.magnifier/refs/heads/main/src/frog.jpg',
    valid: valid.isImage,
  })

export { sample02 }
