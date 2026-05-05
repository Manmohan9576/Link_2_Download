class TwitterProvider {
  formatUrl(url) {
    return url.split('?')[0]; 
  }
  getPlatform() {
    return 'twitter';
  }
}
module.exports = new TwitterProvider();
