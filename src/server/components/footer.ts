import { html } from '@nanoweb/template';
import { cache } from '@nanoweb/template';

const Footer = () => html` <footer><br /><br /><br /></footer> `;

// Cache forever
export default cache(Footer);
