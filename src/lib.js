const styleDefinitions = `
.dropin,.dropout {
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
  z-index: 999;
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

.dropinput textarea,
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

#inputarea,
#rawarea {
  background: #222;
  color: #eee;
}

#previewarea {
	background: #808080;
	color: black;
}

.action {
  width: 160px;
  height: 40px;
  margin: 0 auto;
  font-family: monospace;
  font-size: 24px;
}
`
const style = document.createElement('style')
style.textContent = styleDefinitions

export const valid = {
	isNotEmpty: v => v.length > 0,
	isJSON: v => {
		try {
			JSON.parse(v)
		} catch (e) {
			return false
		}
		return true
	}
}

const optionsIn = {
	parent: document.body,
	apiIn: '',
	autoStart: false,
	showUI: true,
	valid: valid.isNotEmpty,
	placeholderText: 'paste input or drop input file',
	startButtonText: 'start',
	clearButtonText: 'clear',
	pasteButtonText: 'paste',
}

const optionsOut = {
	parent: document.body,
	apiMethod: 'POST',
	apiOut: '',
	apiOutMimeType: 'text/plain',
	autoDownload: false,
	autoCopy: false,
	copyButtonText: 'copy',
	downloadButtonText: 'download',
	downloadFileName: 'output',
	downloadFileMimeType: 'text/plain',
	uploadButtonText: 'upload',
	rawButtonText: 'raw',
	previewButtonText: 'preview',
}

export const dropIn = async (opts = {}) =>

	new Promise((resolve) => {

		const config = { ...optionsIn, ...opts }

		let fileInput, inputarea, startButton

		const debounce = (func, timeout = 250) => {
			let timer
			return (...args) => {
				clearTimeout(timer)
				timer = setTimeout(() => func.apply(this, args), timeout)
			}
		}

		const processText = debounce((text) => {
			startButton.disabled = !config.valid(text)
		})

		const overlay = document.createElement('div')
		overlay.className = 'dropin'
		config.parent.appendChild(overlay)

		if (!config.showUI) {
			overlay.style='background-color: rgba(15,15,35,0.5);'
		} else {
			overlay.innerHTML = `
	<div class="dropinput">
		<span>
			<input type="file" class="fill" />
			<button id="paste">${config.pasteButtonText}</button>
			<button id="clear">${config.clearButtonText}</button>
		</span>
		<textarea id="inputarea" placeholder="${config.placeholderText}"></textarea>
		<span>
			<button id="start" class="action" ${config.valid('') ? '' : 'disabled'}>${config.startButtonText}</button>
		</span>
	</div>`
			inputarea = document.getElementById('inputarea')
			inputarea.focus()
			inputarea.addEventListener('input', (evt) => processText(evt.target.value))
		  fileInput = document.querySelector('input[type=file]')
			fileInput.addEventListener('change', (evt) => readFile(evt.target.files))
			document.getElementById('paste').addEventListener('click', () => paste())
			document.getElementById('clear').addEventListener('click', () => setInput(''))
			startButton = document.getElementById('start')
			startButton.addEventListener('click', () => {
				config.parent.removeChild(overlay)
				resolve(inputarea.value)
			})
		}
		overlay.appendChild(style)

		config.apiIn && fetch(config.apiIn)
			.then(response => response.ok ? response.text() : '')
			.then(data => setInput(data))

		overlay.addEventListener('dragover', (e) => {
			e.preventDefault()
			e.stopPropagation()
			overlay.classList.add('drag')
		})

		overlay.addEventListener('dragleave', (e) => {
			e.preventDefault()
			e.stopPropagation()
			overlay.classList.remove('drag')
		});

		overlay.addEventListener('drop', (e) => {
			e.preventDefault()
			e.stopPropagation()

			overlay.classList.remove('drag')
			readFile(e.dataTransfer.files)
		})

		const setInput = (text) => {
			const isValid = config.valid(text)
			if (config.showUI) {
				inputarea.value = text
				inputarea.select()
				startButton.disabled = !isValid
				startButton.focus()
			}

			if (config.autoStart && isValid) {
				try {
				  config.parent.removeChild(overlay)
				} catch (_) {
					// ignore
				}
				resolve(text)
			}
		}

		const readFile = (files) => {
			if (files.length === 1) {
				const file = files[0]
				const reader = new FileReader()
				reader.onload = (event) => {
					setInput(event.target.result)
				}
				reader.onerror = (error) => {
					console.error('error reading file:', error)
					inputarea.value = '<error reading file>'
				}
				reader.readAsText(file)
			} else {
				inputarea.value = '<please drop a single input text file>'
			}
		}

		const paste = async () => {
			try {
				const text = await navigator.clipboard.readText()
				setInput(text)
			} catch (err) {
				console.error('Failed to read clipboard contents: ', err)
				inputarea.value = '<error reading clipboard>'
			}
		}

	})

export const dropOut = async (output, opts = {}) =>

	new Promise((resolve) => {

		const config = { ...optionsOut, ...opts }

		const download = () => {
			const link = document.createElement('a')
			const url = URL.createObjectURL(
				new File([output], config.downloadFileName, {
					type: config.downloadFileMimeType,
				})
			)
			link.href = url
			link.download = config.downloadFileName
			config.parent.appendChild(link)
			link.click()
			config.parent.removeChild(link)
			window.URL.revokeObjectURL(url)
		}

		const copy = async () => {
			try {
				await navigator.clipboard.writeText(output)
			} catch (err) {
				console.error('Failed to write to clipboard', err)
			}
		}

		const upload = async () => {
			await fetch(config.apiOut, {
		  	method: config.apiMethod,
  			body: output,
				headers: {
    			'content-type': config.apiOutMimeType
				}
			})
		}

		if (config.autoDownload || config.autoCopy) {
			config.autoCopy && copy()
			config.autoDownload && download()
			resolve(true)
			return
		}

		const overlay = document.createElement('div')
		overlay.className = 'dropout'
		overlay.innerHTML = `
<div class="dropoutput">
	<span>
		<span class="fill"></span>
		<button id="preview" disabled>${config.previewButtonText}</button>
		<button id="raw">${config.rawButtonText}</button>
	</span>
	<div id="outputarea">
		<textarea id="rawarea" disabled>${output}</textarea>
		<div id="previewarea">${output}</div>
	</div>
	<span>
		<button id="download" class="action">${config.downloadButtonText}</button>
		<button id="copy" class="action">${config.copyButtonText}</button>
		${config.apiOut && `<button id="upload" class="action">${config.uploadButtonText}</button>`}
	</span>
</div>`
		overlay.appendChild(style)
		config.parent.appendChild(overlay)
		const outputarea = document.getElementById('outputarea')
		const rawarea = document.getElementById('rawarea')
		rawarea.focus()
		rawarea.select()
		outputarea.removeChild(rawarea)
		const previewarea = document.getElementById('previewarea')
		const rawButton = document.getElementById('raw')
		rawButton.addEventListener('click', () => {
			outputarea.removeChild(previewarea)
			outputarea.appendChild(rawarea)
			previewButton.removeAttribute('disabled')
			rawButton.setAttribute('disabled', true)
		})
		const previewButton = document.getElementById('preview')
		previewButton.addEventListener('click', () => {
			outputarea.removeChild(rawarea)
			outputarea.appendChild(previewarea)
			rawButton.removeAttribute('disabled')
			previewButton.setAttribute('disabled', true)
		})
		const downloadButton = document.getElementById('download')
		downloadButton.addEventListener('click', () => {
			download()
			resolve(true)
		})
		const copyButton = document.getElementById('copy')
		copyButton.addEventListener('click', () => {
			copy()
			resolve(true)
		})
		const uploadButton = document.getElementById('upload')
		uploadButton.addEventListener('click', () => {
			upload()
			resolve(true)
		})

	})
