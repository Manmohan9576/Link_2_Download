class RedditProvider {
  formatUrl(url) {
    return url;
  }
  getPlatform() {
    return 'reddit';
  }
}
module.exports = new RedditProvider();
