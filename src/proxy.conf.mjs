export default {
  '/(post-covers|post-images|post-password-covers|post-password-images|post-private-covers|post-private-images|user-avatars|seed|temp)/*': {
    target: 'https://firebasestorage.googleapis.com/v0/b/takabase-local.appspot.com/o/',
    secure: false,
    changeOrigin: true,
    bypass: (req, res) => {
      const filename = req.url.split('/').pop();
      const filenameUid = filename.split('-').pop();

      req.url = encodeURIComponent(req.url.replace(filename, filenameUid).substring(1)) + '?alt=media';
    }
  },
  '/(metadata)/*': {
    target: 'http://localhost:8080/api/v1/utilities',
    secure: false,
    changeOrigin: true
  },
  '/(sitemaps)/*': {
    target: 'http://localhost:8080/api/v1/sitemaps',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/sitemaps/(categories|posts|users).xml$' : '$1',
    }
  }
}
