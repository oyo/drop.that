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
  left: 0;
  top: 0;
}

.drag {
  opacity: 0.5;
  background-color: #858140;
}

.fill {
  width: 100%;
  min-width: 260px;
}

.dropinput,
.dropoutput {
  width: 70%;
  min-width: 360px;
  top: 15%;
  height: 70%;
}

.dropinput > span,
.dropoutput > span {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

#outputarea {
	height: 90%;
}

.dropinput .inputarea,
.dropinput .previewarea,
.dropoutput #outputarea #rawarea,
.dropoutput #outputarea #previewarea {
  width: 100%;
  height: 90%;
  padding: 10px;
  box-sizing: border-box;
  font-size: 16px;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: scroll;
}

.dropinput .inputarea {
  background: #222;
  color: #eee;
}

.dropinput .previewarea {
	background: #808080;
	color: black;
}

.dropinput .previewarea iframe {
  width: 100%;
  height: 100%;
}

.hide {
  display: none;
}

.action {
  width: 160px;
  height: 40px;
  margin: 0 auto;
  font-family: monospace;
  font-size: 24px;
}`

export const style = <HTMLStyleElement>N('style', styleDefinitions)
