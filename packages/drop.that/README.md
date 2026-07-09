# drop.that

A generic input upload and output download component for web applications.
Typically to process input files provided by the user, like in online file
conversion tools. This is useful in pure frontend web applications without backend.
Nonetheless there is a basic support for REST services in case there is a
backend or CORS is enabled.

![Process Flow](../../apps/website/public/img/drop.that.svg 'Drop Process Download')

In your web app

```JavaScript
  input = await dropIn()
  output = process(input)  // your application logic
  await dropOut(output)
```

Example: https://oyo.github.io/drop.that/

### Get started

Here is a simple example - drop, upload, paste or enter some text and split the words into lines.

```html
<script type="module">
  import { dropIn, dropOut } from 'https://oyo.github.io/drop.that/lib.js'
  const input = await (await dropIn()).text()
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

```JavaScript
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

### Setup

Add the library

```bash
npm i drop.that
# or
yarn add drop.that
```

then import

```JavaScript
import { dropIn, dropOut } from 'drop.that'
```

### Data formats

The library can process any kind of text or binary data.
Preview is available for:

- Text file formats
- Bitmap images
- SVG
- PDF

### Caveats

Not meant to process huge amounts of data.
The style is not customizable yet.
