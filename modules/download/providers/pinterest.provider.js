const puppeteer = require('puppeteer');
const resolvePinterestUrl = require('../../../shared/utils/resolvePinterestUrl');

class PinterestProvider {

  async formatUrl(url) {
    const media = await this.getMedia(url);
    if (!media || !media.url) throw new Error("Could not extract media URL from Pinterest");
    return media.url;
  }

  async getMedia(url) {
    let finalUrl = url;

    if (url.includes("pin.it")) {
      finalUrl = await resolvePinterestUrl(url);
    }

    console.log("Final URL:", finalUrl);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    let videoUrl = null;
    let imageUrl = null;

    try {
      page.on('response', async (response) => {
        const resUrl = response.url();

        // 🎥 Video (priority)
        if (resUrl.includes('.mp4')) {
          videoUrl = resUrl;
        }

        // 🖼 Image (fallback)
        if (
          resUrl.includes('pinimg.com') &&
          (resUrl.includes('.jpg') || resUrl.includes('.png'))
        ) {
          imageUrl = resUrl;
        }
      });

      await page.goto(finalUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await new Promise(r => setTimeout(r, 4000));

      if (videoUrl) {
        return { url: videoUrl, type: "mp4" };
      }

      if (imageUrl) {
        return { url: imageUrl, type: "image" };
      }

      throw new Error("No media found");

    } catch (err) {
      console.error("Pinterest Error:", err.message);
      throw err;
    } finally {
      await browser.close();
    }
  }
}

module.exports = new PinterestProvider();