import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DEMO = path.resolve(__dirname, "../dist-demo");

if (!fs.existsSync(DIST_DEMO)) {
  console.error("dist-demo directory does not exist!");
  process.exit(1);
}

const rootHtml = fs.readFileSync(path.join(DIST_DEMO, "index.html"), "utf8");

const ROUTES = [
  "orazaka",
  "yororis",
  "jarvis",
  "liquid-glass",
  "neural-lattice",
  "krizaka-ui",
  "maps",
  "data-motion",
  "specs",
  "architecture",
  "caustics",
  "lattice",
  "kz-ui",
];

// For subdirectories, replace relative paths "./assets/" with "../assets/"
const subfolderHtml = rootHtml
  .replaceAll('src="./assets/', 'src="../assets/')
  .replaceAll('href="./assets/', 'href="../assets/')
  .replaceAll('href="./"', 'href="../"')
  .replaceAll('href="./favicon.svg"', 'href="../favicon.svg"');

for (const route of ROUTES) {
  const dirPath = path.join(DIST_DEMO, route);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, "index.html"), subfolderHtml, "utf8");
}

console.log(`✅ Generated ${ROUTES.length} static REST route directories in dist-demo/`);

// Generate 404.html redirect fallback for GitHub Pages SPA
const spa404Html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      // Single Page Apps for GitHub Pages
      // MIT License https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1;
      var l = window.location;
      var redirectPath = l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/');
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        redirectPath + (l.search ? '&' + l.search.slice(1) : '') + l.hash
      );
    </script>
  </head>
  <body>
    Redirecting to demonstration...
  </body>
</html>
`;

fs.writeFileSync(path.join(DIST_DEMO, "404.html"), spa404Html, "utf8");
console.log("✅ Generated dist-demo/404.html SPA fallback");
