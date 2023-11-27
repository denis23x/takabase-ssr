const SitemapGenerator = require("sitemap-generator")

const sitemapGenerator = SitemapGenerator("https://draft-ssr.web.app", {
  stripQuerystring: false,
  lastMod: true,
  priorityMap: [1.0, 0.8, 0.6, 0.4, 0.2, 0],
  filepath: "./src/sitemap.xml",
})

sitemapGenerator.start()
