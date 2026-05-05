class Mp3Strategy {
  static getCommand(cleanUrl, outputPathTemplate, proxyUrl) {
    const proxy = proxyUrl ? ` --proxy "${proxyUrl}"` : '';
    const cookies = process.env.YTDLP_COOKIES_PATH ? ` --cookies "${process.env.YTDLP_COOKIES_PATH}"` : '';
    return `yt-dlp --js-runtimes node --no-playlist --force-ipv4${proxy}${cookies} -x --audio-format mp3 -o "${outputPathTemplate}" "${cleanUrl}"`;
  }
}

module.exports = Mp3Strategy;
