declare module 'fastify-error-page';
declare module 'callsite';
declare module 'nouislider/distribute/nouislider.css';

declare const __IS_DEVELOPMENT__: boolean;
declare const __BUILD_TIMESTAMP__: string;
declare const __REVISION__: string;

declare module '*.svg';
declare module '*.scss';

type AtomicObject = Function | Date | RegExp | Boolean | Number | String; // eslint-disable-line @typescript-eslint/ban-types
type RecursiveReadonly<T> = T extends AtomicObject ? T : { +readonly [P in keyof T]: RecursiveReadonly<T[P]> };
