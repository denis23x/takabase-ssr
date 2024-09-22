export default {
  '/(post-covers|post-images|post-password-covers|post-password-images|post-private-covers|post-private-images|user-avatars|seed|temp)/*': {
    target: 'https://firebasestorage.googleapis.com/v0/b/takabase-local.appspot.com/o',
    secure: false,
    changeOrigin: true,
    bypass: (req, res) => {
      req.url = req.url.replace(/\/(?=[^\/]*\.webp$)/, '%2F') + '?alt=media';
    }
  }
}
