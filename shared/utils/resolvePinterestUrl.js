// shared/utils/resolvePinterestUrl.js

const puppeteer = require('puppeteer');

async function resolvePinterestUrl(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    return page.url(); // final redirected URL
  } catch (err) {
    console.error("Resolve Error:", err.message);
    return url;
  } finally {
    await browser.close();
  }
}

module.exports = resolvePinterestUrl;