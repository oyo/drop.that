import { dropIn, dropOut, fromText, toText } from 'drop.that'

const splitToLines = async (text: string) => text.split(/\s+/g).join('\n')

const inOptions = {
  placeholderText: 'enter some words or drop input text file',
}

const process = () => dropIn(inOptions).then(toText).then(splitToLines).then(fromText).then(dropOut)

export default {
  label: 'Split words into lines',
  process,
}
