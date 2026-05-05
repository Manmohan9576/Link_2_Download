class Mp4Strategy {
  static getCommand(cleanUrl, outputPathTemplate, quality, proxyUrl) {

    const isYouTube = /youtube|youtu\.be/.test(cleanUrl);
    const isPinterest = /pinterest/.test(cleanUrl);
    const isInstagram = /instagram/.test(cleanUrl);
    const isFacebook = /facebook|fb\.watch/.test(cleanUrl);
    const isReddit = /reddit\.com/.test(cleanUrl);
    const isTiktok = /tiktok\.com/.test(cleanUrl);
    const isTwitter = /twitter\.com|x\.com/.test(cleanUrl);
    const isTwitch = /twitch\.tv/.test(cleanUrl);

    let qualityFilter;

    // Social Media Platforms → simple format
    if (isPinterest || isInstagram || isFacebook || isReddit || isTiktok || isTwitter || isTwitch) {
      qualityFilter = 'best';
    } else {
      //  YouTube → advanced formats
      if (quality === 'low') {
        qualityFilter = 'worstvideo+worstaudio/worst';
      } else if (quality === 'medium') {
        qualityFilter = 'bestvideo[height<=720]+bestaudio/best[height<=720]';
      } else {
        qualityFilter = 'bestvideo+bestaudio/best';
      }
    }

    const proxy = proxyUrl ? ` --proxy "${proxyUrl}"` : '';
    const cookies = process.env.YTDLP_COOKIES_PATH ? ` --cookies "${process.env.YTDLP_COOKIES_PATH}"` : '';

    //  Build command smartly
    let command = `yt-dlp --js-runtimes node --no-playlist --force-ipv4${proxy}${cookies} -f "${qualityFilter}" -o "${outputPathTemplate}" "${cleanUrl}"`;

    //  Only YouTube needs merging
    if (isYouTube) {
      command = `yt-dlp --js-runtimes node --no-playlist --force-ipv4${proxy}${cookies} -f "${qualityFilter}" --merge-output-format mp4 -o "${outputPathTemplate}" "${cleanUrl}"`;
    }

    return command;
  }
}

module.exports = Mp4Strategy;
