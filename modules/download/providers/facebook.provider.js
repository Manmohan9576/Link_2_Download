class FacebookProvider {
  formatUrl(url) {
    // yt-dlp handles facebook.com/watch/?v=... and fb.watch/... natively.
    // Query parameters shouldn't be stripped as they often contain the video ID.
    return url;
  }

  getPlatform() {
    return 'facebook';
  }
}

module.exports = new FacebookProvider();
