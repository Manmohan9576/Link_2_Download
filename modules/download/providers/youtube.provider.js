const { cleanVideoUrl } = require('../../../shared/utils/cleanUrl');

class YoutubeProvider {
  static formatUrl(url) {
    return cleanVideoUrl(url);
  }
}

module.exports = YoutubeProvider;
