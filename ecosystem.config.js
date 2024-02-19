module.exports = [
  {
    script: "dist/takabase-ssr/server/main.js",
    name: "app-takabase-ssr",
    exec_mode: "cluster",
    instances: 4,
    max_memory_restart: "256M",
  },
]
