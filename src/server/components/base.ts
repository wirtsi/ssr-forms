import { html, TemplateElement } from '@nanoweb/template';
import getAssetUrl from '../utilities/get-asset-url';

const coreUrl = getAssetUrl('core.js');
const mainUrl = getAssetUrl('main.js');
const stylesUrl = getAssetUrl('styles.css');

const Base = (props: { title: string }, ...children: TemplateElement[]) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>Checkout - ${props.title}</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="${stylesUrl}" rel="stylesheet" />
      <link rel="stylesheet" href="https://bulma.io/vendor/fontawesome-free-5.15.2-web/css/all.min.css" />
      <meta name="description" content="Checkout" />
    </head>
    <body data-instant-allow-query-string>
      <section class="section">
        <div class="container">${children}</div>
      </section>
      <script src="${coreUrl}"></script>
      <script src="${mainUrl}"></script>
    </body>
  </html>
`;

export default Base;
