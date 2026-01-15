# drop.that

A drop input and download output component for web applications.
Typically to process an input file provided by the user, like in
online file conversion tools. This is useful in pure frontend
web applications, where you can't or don't want to deal with any
backend API or database storage. Nonetheless there is a basic
support for REST services if you have them running or CORS is
enabled.

![Process Flow](src/drop.that.svg "Drop Process Download")

In your web app (pseudocode)

``` JavaScript
  input = receiveInput()  // handled by drop.that
  output = process(input) // you only implement the logic
  downloadOutput(output)  // handled by drop.that
```

Example: https://oyo.github.io/drop.that/

### Get started

Here is a simple example. Drop, upload, paste or enter some text.
It will split the words into lines.

``` html
  <script type="module">
    import { dropIn, dropOut } from 'https://oyo.github.io/drop.that/lib.js'
    const input = await dropIn()
    const output = input.split(' ').join('\n')
    await dropOut(output)
  </script>
```

See https://oyo.github.io/drop.that/0-simple.html

### Customize

Here is another example: formatting a JSON file.
This time we don't show any overlay.
Simply drag a JSON file into the browser window and it gets
processed and downloaded immediately on dropping a valid input.

``` JavaScript
  const input = await dropIn({
    showUI: false,
    autoStart: true,
    valid: valid.isJSON,
  })

  const output = JSON.stringify(
    JSON.parse(input), null, 2
  )

  await dropOut(
    output,
    {
      autoDownload: true,
      downloadFileMimeType: 'application/json'
    }
  )
```

See https://oyo.github.io/drop.that/1-json.html

### Node.js

In a Node.js environment add the library

``` bash
npm i drop.that
# or
yarn add drop.that
```

then import

``` JavaScript
import { dropIn, dropOut } from 'drop.that'
```

### Usage

Currently only single files in any text file format are supported as input.

### Caveats

Not meant to process huge amounts of data.
The style is not customizable yet.
