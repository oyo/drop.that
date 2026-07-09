import { dropIn, dropOut, fromSVG, toText, valid } from 'drop.that'
import { wordCount, wordGraph } from '../util/util.ts'

const inOptions = {
  url: 'https://oyo.github.io/drop.that/data/wordcount.txt',
  valid: valid.isText,
  startButtonText: 'count',
}

const countGraph = (text: string) => wordGraph(wordCount(text))

const process = () => dropIn(inOptions).then(toText).then(countGraph).then(fromSVG).then(dropOut)

export default {
  label: 'Count words in a text',
  process,
}
