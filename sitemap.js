const SitemapGenerator = require("sitemap-generator")

const sitemapGenerator = SitemapGenerator("http://localhost:4200", {
  stripQuerystring: false,
  filepath: "./src/sitemap.xml",
})

sitemapGenerator.start()
