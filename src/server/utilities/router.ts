import fastify, { RouteHandlerMethod, RouteOptions } from 'fastify';
import cookie from 'fastify-cookie';
import fastifyErrorPage from 'fastify-error-page';
import multipart from 'fastify-multipart';
import compress from 'fastify-compress';
import helmet from 'fastify-helmet';
import fastifyStatic from 'fastify-static';
import formBody from 'fastify-formbody';
import path from 'path';
import qs from 'qs';
import { readFileSync } from 'fs';
import { stringify } from 'qs';
import { isDevelopment } from '..';
import { asyncLocalStorage, getRequest } from './context';
import { renderToString, Template } from '@nanoweb/template';
import getAssetUrl from './get-asset-url';

const app = fastify({
  logger: !isDevelopment,
  querystringParser: (str: string) => qs.parse(str) as Record<string, string | string[]>,
}).decorateRequest('user', null);

const BUILD_PATH = path.join(__dirname, '../../../build');
if (isDevelopment) {
  app
    .register(fastifyErrorPage)
    .register(formBody)
    .addHook('onSend', (_request, reply, payload, done) => {
      if (typeof payload === 'string' && reply.getHeader('Content-Type') === 'text/html') {
        done(
          null,
          payload.replace('</body>', '<script src="http://localhost:35729/livereload.js?snipver=1"></script></body>'),
        );
      } else {
        done(null, payload);
      }
    });
} else {
  const REVISION = readFileSync(path.join(BUILD_PATH, 'REVISION'), 'utf-8');
  app
    .addHook('onSend', (_request, reply, payload, done) => {
      if (!reply.hasHeader('cache-control')) {
        reply.header('cache-control', 'public, max-age=1800');
      }
      reply.header('x-revision', REVISION);
      done(null, payload);
    })
    .register(compress)
    .register(formBody)
    .register(helmet, {
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'font-src': ["'self'", 'fonts.gstatic.com'],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          'img-src': ["'self'", 'cdn.aboutyou.de'],
        },
      },
    });
}

app
  .register(cookie)
  .register(multipart, { addToBody: true })
  .register(fastifyStatic, {
    immutable: !isDevelopment,
    maxAge: isDevelopment ? 0 : 2592000000,
    prefix: '/assets/bundles/',
    root: BUILD_PATH,
    decorateReply: false,
  })
  .register(fastifyStatic, {
    prefix: '/assets/',
    maxAge: isDevelopment ? 0 : 172800000,
    root: path.join(__dirname, '../../client/assets'),
  })
  .listen(3000, '0.0.0.0');

interface PageOptions extends Omit<RouteOptions, 'method' | 'handler'> {
  method?: RouteOptions['method'];
  handler: () => Template | Promise<Template>;
}
const alphabeticalSort = (a: string, b: string) => a.localeCompare(b);

type Query = Record<string, string | number | string[] | number[] | undefined>;

const sortArrays = (query: Query) =>
  Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value.slice().sort() : value]),
  );

const getLink = (url: string) => (params: Record<string, string | number> = {}, query: Query = {}) => {
  const stringQuery = stringify(sortArrays(query), { sort: alphabeticalSort });
  return (
    Object.entries({ ...params })
      .reduce((prev, [key, value]) => prev.replace(key === '*' ? /\*$/ : `:${key}`, String(value)), url)
      .replace(/\/\//g, '/') + (stringQuery ? '?' + stringQuery : '')
  );
};

const transformResult = (text: string, webComponents: string[]) => {
  if (!webComponents.length) {
    return text;
  }
  const to =
    webComponents.map((name: string) => `<script src="${getAssetUrl(`${name}.js`)}"></script>`).join('') + '</body>';
  return text.replace('</body>', to);
};

export const addPage = (options: PageOptions) => {
  const url = `${options.url}`.replace(/\/\//g, '/');
  const handler: RouteHandlerMethod = (request, reply) => {
    reply.header('content-type', 'text/html');
    asyncLocalStorage.run({ request, reply }, async () => {
      reply.type('text/html').send(await renderToString(options.handler(), { transformResult }));
    });
  };
  app.route({ method: 'GET', ...options, url, handler });
  return getLink(url.replace(/\(.*\)/g, ''));
};

interface EndpointOptions extends Omit<RouteOptions, 'method' | 'handler'> {
  method?: RouteOptions['method'];
  handler: () => any | Promise<any>;
}

export const addEndpoint = (options: EndpointOptions) => {
  const handler: RouteHandlerMethod = async (request, reply) => {
    reply.header('content-type', 'text/html');
    await asyncLocalStorage.run({ request, reply }, async () => {
      try {
        const result = await options.handler();
        if (!reply.sent) {
          reply.type('application/json').send(JSON.stringify(result));
        }
      } catch (e) {
        console.error(e);
      }
    });
  };
  app.route({ method: 'GET', ...options, handler });
  return getLink(options.url);
};
