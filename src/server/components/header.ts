import { getRequest } from '../utilities/context';
import { html } from '@nanoweb/template';
import { cache } from '@nanoweb/template';

const Header = () => html`
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item">
        <img src="/assets/logo.png" width="112" height="28" class="has-background-black" />
      </a>

      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        <a class="navbar-item"> Address </a>
        <a class="navbar-item"> Basket </a>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <a class="button is-primary">
              <strong> My Account</strong>
            </a>
            <a class="button is-light"> Log ot </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
`;

// Use request url as cache key
const cacheKey = () => getRequest().url;

export default cache(Header, { cacheKey, stdTTL: 600 });
