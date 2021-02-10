import { html, TemplateElement } from '@nanoweb/template';
import Header from './header';
// import Navigation from './navigation';
import Footer from './footer';
import Base from './base';

const Page = (props: { title: string }, ...children: TemplateElement[]) =>
  Base(
    props,
    html`
      <div class="md:container md:mx-auto">
        ${Header()}
        <main>${children}</main>
        ${Footer()}
      </div>
    `,
  );

export default Page;
