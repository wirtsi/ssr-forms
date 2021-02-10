import { readdirSync } from "fs";
import path from "path";

const assets = Object.fromEntries(
  readdirSync(path.resolve(__dirname, "../../../build")).map((filename) => [
    process.env.NODE_ENV === "production"
      ? filename.split(/-(.+)/)[1]
      : filename,
    `/assets/bundles/${filename}`,
  ])
);

export default (name: string) =>
  process.env.NODE_ENV === "production"
    ? assets[name]
    : `/assets/bundles/${name}`;
