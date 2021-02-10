import { readdirSync } from 'fs';
import { join } from 'path';

export const isDevelopment = process.env.NODE_ENV === 'development';

const PAGES_PATH = './pages/';
const API_PATH = './api/';

[API_PATH, PAGES_PATH]
  .flatMap((path: string) => readdirSync(join(__dirname, path)).map(filename => join(__dirname, path, filename)))
  .forEach(filename => require(filename));
