/** Native service layer */

// self.addEventListener('install', (event) => {
//   console.log("install")
// });

// self.addEventListener('activate', (event) => {
//   console.log("activate")
// });

// self.addEventListener('fetch', (event) => {
//   console.log("fetch")
// });

/** NGSW service worker */

importScripts("./ngsw-worker.js")
