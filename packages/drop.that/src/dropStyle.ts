import { N } from './ui.ts'

const styleDefinitions = `.dropin,.dropout {
  position: fixed;  
  margin: 0;
  padding: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgb(15, 15, 35);
  color: white;
  font-family: "Source Code Pro", monospace;
  font-size: 2vh;
  z-index: 998;
}

button.dropclose {
  position: fixed;  
  z-index: 999;
  color: #a0a0a0;
  width: 6vh;
  height: 6vh;
  font-size: 3vh;
  background: none;
  border: none;
  right: 0;
  top: 0;
}

.drag {
  opacity: 0.5;
  background-color: #858140;
}

.dropin .fill,
.dropout .fill {
  width: 100%;
  min-width: 260px;
}

.dropinput,
.dropoutput {
  height: 85%;
  width: 85%;
  min-width: 365px;
  top: 7%;
}

.dropinput > span,
.dropoutput > span {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.viewswitch {
  width: 100%;
  height: 90%;
}

.viewswitch .textarea,
.viewswitch .previewarea {
  width: 100%;
  height: 100%;
  padding: 0;
}

.viewswitch .textarea, 
.viewswitch .textarea { 
  background: #222;
  color: #eee;
  padding: 10px;
  box-sizing: border-box;
  font-size: 16px;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: scroll;
}

.viewswitch .previewarea {
  display: flex;
  justify-content: center;
  align-items: center;
	background: #808080;
	color: black;
}

.previewarea img,
.previewarea svg {
  width: 100%;
  height: 100%; 
  object-fit: contain;
}

.previewarea iframe {
  width: 99.7%;
  height: 99.2%;
}

.inputactions button,
.inputactions input {
  height: 24px;
  font-size: 16px;
}

.dropoutput .action,
.dropinput .action {
  width: 160px;
  height: 40px;
  margin: 0 auto;
  font-family: monospace;
  font-size: 24px;
}`

export const style = <HTMLStyleElement>N('style', styleDefinitions)
