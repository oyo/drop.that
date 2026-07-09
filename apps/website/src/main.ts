import { samples } from './samples/'
import { addEvents, N } from './util/ui'
import './style.css'

document.body.appendChild(
  N(
    'div',
    [
      N('h1', 'drop.that'),
      N(
        'p',
        `A generic input upload and output download component for web applications.
Typically to process input files provided by the user, like in online file
conversion tools. This is useful in pure frontend web applications without backend.
Nonetheless there is a basic support for REST services in case there is a
backend or CORS is enabled.`,
      ),
      N('img', undefined, { src: './img/drop.that.svg' }),
      N('h3', 'Examples'),
      N(
        'ul',
        samples.map((s) =>
          N(
            'li',
            addEvents(N('a', s.label, { href: '#' }), {
              click: async (e: Event) => {
                e.preventDefault()
                await s.process()
              },
            }),
          ),
        ),
      ),
      N('h3', 'Resources'),
      N('ul', [
        N('li', [
          N('img', undefined, {
            width: '16',
            height: '16',
            src: 'https://github.githubassets.com/favicons/favicon.svg',
          }),
          N('a', ' Source code', { href: 'https://github.com/oyo/drop.that/' }),
        ]),
        N('li', [
          N('img', undefined, {
            width: '16',
            height: '16',
            src: 'https://static-production.npmjs.com/da3ab40fb0861d15c83854c29f5f2962.png',
          }),
          N('a', ' NPM package', { href: 'https://www.npmjs.com/package/drop.that/' }),
        ]),
      ]),
    ],
    { class: 'content' },
  ) as HTMLDivElement,
)
