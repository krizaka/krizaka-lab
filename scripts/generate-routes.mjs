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
const SITE = "https://motion.krizaka.com";

const ROUTES = [
  "orazaka",
  "yororis",
  "jarvis",
  "liquid-glass",
  "neural-lattice",
  "krizaka-ui",
  "maps",
  "conversation",
  "journey",
  "figures",
  "overlays",
  "people",
  "transitions",
  "data-motion",
  "specs",
  "architecture",
  "caustics",
  "lattice",
  "kz-ui",
  // krizaka-ui#434: the guides, the scenarios, the experiments
  "list-arrival",
  "live-number",
  "page-transition",
  "button-feedback",
  "streaming-answer",
  "route-draw",
  "pin-drop",
  "tape-stick",
  "paper-sway",
  "develop",
  "crt-power-on",
  "crt-power-off",
  "neon-flicker",
  "dashboard",
  "chat",
  "checkout",
  "delivery",
  "wall",
  "experiments",
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
  const routeUrl = `${SITE}/${route}/`;
  const routeHtml = subfolderHtml
    .replace(/(<link rel="canonical" href=")[^"]+(" \/>)/, `$1${routeUrl}$2`)
    .replace(/(<meta property="og:url" content=")[^"]+(" \/>)/, `$1${routeUrl}$2`);
  fs.writeFileSync(path.join(dirPath, "index.html"), routeHtml, "utf8");
}

console.log(`✅ Generated ${ROUTES.length} static REST route directories in dist-demo/`);

// Generate 404.html redirect fallback for GitHub Pages SPA
const spa404Html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      // Single Page Apps for GitHub Pages; the lab is served from the root of motion.krizaka.com (no repo subpath)
      // MIT License https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 0;
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

// SEO: a sitemap of every address on the custom domain.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["", ...ROUTES].map((r) => `  <url><loc>${SITE}/${r ? r + "/" : ""}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(DIST_DEMO, "sitemap.xml"), sitemap, "utf8");
console.log("✅ Generated dist-demo/sitemap.xml");
