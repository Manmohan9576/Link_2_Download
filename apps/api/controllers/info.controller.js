const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { z } = require('zod');
const { getProvider } = require('../../../modules/download/providers');
const redisClient = require('../../../infra/db/redis');

const infoSchema = z.object({
  url: z.string().url()
});

class InfoController {
  static async fetchInfo(request, reply) {
    try {
      const { url } = infoSchema.parse(request.body);
      
      const provider = getProvider(url);
      const cleanUrl = provider.formatUrl
        ? await provider.formatUrl(url)
        : url;

      if (process.env.ENABLE_SERVER_METADATA !== 'true') {
        return reply.send({
          success: true,
          title: 'Ready to download',
          thumbnail: '',
          duration: 0,
          resolutions: [1080, 720, 480],
          formats: [],
          url: cleanUrl,
          description: '',
          uploader: '',
        });
      }
        
      // Handle direct media URLs returned by some providers (e.g., Pinterest)
      if (cleanUrl.match(/\.(mp4|webm)$/i)) {
        return reply.send({
          success: true,
          title: 'Direct Video',
          thumbnail: '',
          duration: 0,
          resolutions: [1080, 720, 480],
          formats: [{ url: cleanUrl, ext: 'mp4' }],
          url: cleanUrl,
          description: '',
          uploader: 'Direct Link',
        });
      } else if (cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        return reply.send({
          success: true,
          title: 'Direct Image',
          thumbnail: cleanUrl,
          duration: 0,
          resolutions: [],
          formats: [{ url: cleanUrl, ext: 'jpg' }],
          url: cleanUrl,
          description: '',
          uploader: 'Direct Link',
        });
      }

      // Fetch metadata from yt-dlp with proxy fallback
      const ProxyService = require('../../../shared/services/proxy.service');
      const cookies = process.env.YTDLP_COOKIES_PATH ? ` --cookies "${process.env.YTDLP_COOKIES_PATH}"` : '';
      
      let stdout;
      const cacheKey = `info:${cleanUrl}`;
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        stdout = cached;
        console.log(`[Cache Hit] Serving metadata for ${cleanUrl} from Redis`);
      } else {
        console.log(`[Cache Miss] Fetching metadata for ${cleanUrl} using yt-dlp`);
        stdout = await ProxyService.executeWithFallback(async (proxyUrl) => {
          const proxyFlag = proxyUrl ? ` --proxy "${proxyUrl}"` : '';
          const { stdout: execOut } = await exec(`yt-dlp --js-runtimes node --no-playlist --force-ipv4${proxyFlag}${cookies} -j "${cleanUrl}"`, { timeout: 15000 });
          return execOut;
        });
        
        // Cache for 24 hours (86400 seconds)
        await redisClient.set(cacheKey, stdout, 'EX', 86400);
      }
      
      const info = JSON.parse(stdout);
      
      // Parse available video qualities
      // We extract unique heights to present realistic options like 1080p, 720p
      let availableQualities = [];
      if (info.formats && Array.isArray(info.formats)) {
        const heights = info.formats
          .filter(f => f.vcodec !== 'none' && f.height)
          .map(f => f.height);
        availableQualities = [...new Set(heights)].sort((a, b) => b - a);
      }

      return reply.send({
        success: true,
        title: info.title || 'Unknown Title',
        thumbnail: info.thumbnail || '',
        duration: info.duration || 0,
        resolutions: availableQualities,
        formats: info.formats,
        url: info.url,
        description: info.description || '',
        uploader: info.uploader || '',
        uploader_url: info.uploader_url || '',
        view_count: info.view_count || 0,
        like_count: info.like_count || 0,
        dislike_count: info.dislike_count || 0,
        comment_count: info.comment_count || 0, 
        channel_id: info.channel_id || '',
        channel_url: info.channel_url || '',
        channel_follower_count: info.channel_follower_count || 0,
        channel_video_count: info.channel_video_count || 0,
        channel_view_count: info.channel_view_count || 0,
        channel_like_count: info.channel_like_count || 0,
        channel_dislike_count: info.channel_dislike_count || 0,
        channel_comment_count: info.channel_comment_count || 0,
      });
      
    } catch (err) {
      console.error("Fetch Info Error:", err.message);
      if (err.stderr) {
        console.error("yt-dlp stderr:", err.stderr);
      }
      return reply.status(400).send({ 
        error: "Failed to fetch video information.", 
        details: err.stderr ? err.stderr.trim() : err.message 
      });
    }
  }
}

module.exports = InfoController;
