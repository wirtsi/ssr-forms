import { html } from '@nanoweb/template';
import { addPage } from '../utilities/router';
import { getRequest } from '../utilities/context';
import Page from '../components/page';
import Ajv, { ErrorObject } from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
import validation from 'ajv/dist/vocabularies/validation';

interface Body {
  user: string;
}

const Address = () => {
  const { body } = getRequest<any, any, Body>();

  const schema = {
    type: 'object',
    properties: {
      user: {
        type: 'string',
        minLength: 2,
        maxLength: 10,
      },
      email: {
        type: 'string',
        format: 'email',
      },
    },
    required: ['user', 'email'],
  };
  const ajv = new Ajv();
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (body) {
    validate(body);
  }

  const validField = (field: string, errors: ErrorObject[] | null | undefined) => {
    if (!errors) {
      return true;
    }
    return !errors.find(el => el.dataPath.substr(1) == field);
  };

  const getErrorMessage = (field: string, errors: ErrorObject[] | null | undefined) => {
    if (!errors) {
      return true;
    }
    const error = errors.find(el => el.dataPath.substr(1) == field);
    if (error) {
      return error.message;
    } else {
      return '';
    }
  };

  console.log(body);
  console.log(validate.errors);
  return Page(
    { title: 'Address' },
    html`<form target="/" method="POST">
      <div class="field">
        <label class="label">Username</label>
        <div class="control has-icons-left has-icons-right">
          <input
            class="input ${body && (validField('user', validate.errors) ? 'is-success' : 'is-danger')}"
            type="text"
            name="user"
            placeholder="Text input"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-user"></i>
          </span>
          ${body &&
          html`<span class="icon is-small is-right">
            <i class="fas ${validField('user', validate.errors) ? 'fa-check' : 'fa-exclamation-triangle'}"></i>
          </span>`}
        </div>
      </div>

      <div class="field">
        <label class="label">Email</label>
        <div class="control has-icons-left has-icons-right">
          <input class="input" type="email" name="email" placeholder="Email input" value="hello@foo.com" />
          <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
          </span>
          <span class="icon is-small is-right">
            <i class="fas fa-exclamation-triangle"></i>
          </span>
        </div>
      </div>

      <div class="field">
        <label class="label">Subject</label>
        <div class="control">
          <div class="select" name="subject">
            <select>
              <option>Select dropdown</option>
              <option>With options</option>
            </select>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">Message</label>
        <div class="control">
          <textarea class="textarea" name="message" placeholder="Textarea"></textarea>
        </div>
      </div>

      <div class="field">
        <div class="control">
          <label class="checkbox">
            <input type="checkbox" name="agreed" />
            I agree to the <a href="#">terms and conditions</a>
          </label>
        </div>
      </div>

      <div class="field is-grouped">
        <div class="control">
          <button class="button is-link">Submit</button>
        </div>
        <div class="control">
          <button class="button is-link is-light">Cancel</button>
        </div>
      </div>
    </form>`,
  );
};

const getHomepageLink = addPage({ url: '/', handler: Address });
addPage({ url: '/', method: 'POST', handler: Address });

export default getHomepageLink;
