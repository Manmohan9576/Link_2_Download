class TwitchProvider {
  formatUrl(url) {
    return url.split('?')[0];
  }
  getPlatform() {
    return 'twitch';
  }
}
module.exports = new TwitchProvider();
