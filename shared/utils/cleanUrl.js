function cleanVideoUrl(videoUrl) {
  try {
    const urlObj = new URL(videoUrl);
    videoUrl = videoUrl.trim();

    // 👉 YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId;

      if (urlObj.searchParams.get('v')) {
        videoId = urlObj.searchParams.get('v');
      } else {
        videoId = urlObj.pathname.split('/')[1];
      }

      if (!videoId) throw new Error("Invalid YouTube URL");

      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    // 👉 Instagram
    if (videoUrl.includes('instagram.com')) {
      return `${urlObj.origin}${urlObj.pathname}`;
    }

    // 👉 Pinterest (IMPORTANT FIX)
    if (videoUrl.includes("pinterest.com") || videoUrl.includes("pin.it")) {
      return videoUrl; // ✅ URL hi return karo
    }

    return videoUrl;

  } catch (err) {
    console.error("Invalid URL:", err.message);
    return videoUrl;
  }
}

module.exports = { cleanVideoUrl };