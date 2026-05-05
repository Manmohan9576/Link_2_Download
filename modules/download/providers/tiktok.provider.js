class TiktokProvider {
  formatUrl(url) {
    // Strip query strings to ensure yt-dlp hashes pure video url if needed, or pass through
    return url.split('?')[0]; 
  }
  getPlatform() {
    return 'tiktok';
  }
}
module.exports = new TiktokProvider();
