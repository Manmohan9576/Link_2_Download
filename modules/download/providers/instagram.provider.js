class InstagramProvider {
  formatUrl(url) {
    // remove query params like ?igshid=...
    return url.split('?')[0];
  }

  // future ready (optional)
  getPlatform() {
    return 'instagram';
  }
}

module.exports = new InstagramProvider();