module.exports = [
  {
    script: "dist/draft-ssr/server/main.js",
    name: "app-ssr",
    exec_mode: "cluster",
    instances: 2,
    max_memory_restart: "512M",
  },
]
