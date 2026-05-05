const YoutubeProvider = require('./youtube.provider');
const InstagramProvider = require('./instagram.provider');
const PinterestProvider = require('./pinterest.provider');
const FacebookProvider = require('./facebook.provider');
const RedditProvider = require('./reddit.provider');
const TiktokProvider = require('./tiktok.provider');
const TwitterProvider = require('./twitter.provider');
const TwitchProvider = require('./twitch.provider');

function getProvider(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return YoutubeProvider;
  }

  if (url.includes('instagram.com')) {
    return InstagramProvider;
  }

  if (url.includes('pinterest.com') || url.includes('pin.it')) {
    return PinterestProvider;
  }

  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return FacebookProvider;
  }

  if (url.includes('reddit.com')) {
    return RedditProvider;
  }

  if (url.includes('tiktok.com')) {
    return TiktokProvider;
  }

  if (url.includes('twitter.com') || url.includes('x.com')) {
    return TwitterProvider;
  }

  if (url.includes('twitch.tv')) {
    return TwitchProvider;
  }

  throw new Error('Unsupported platform');
}

module.exports = { getProvider };