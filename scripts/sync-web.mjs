import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "www");

const staticFiles = [
  "index.html",
  "app.js",
  "styles.css",
  "config.js",
  "photos.json",
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of staticFiles) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, file));
  }
}

const manifest = {
  name: "Gallery",
  short_name: "Gallery",
  start_url: ".",
  display: "standalone",
  background_color: "#0d0d10",
  theme_color: "#0d0d10",
  description: "Private photo gallery powered by Yandex Object Storage.",
};

fs.writeFileSync(
  path.join(outDir, "manifest.webmanifest"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log(`Synced web files to ${outDir}`);
