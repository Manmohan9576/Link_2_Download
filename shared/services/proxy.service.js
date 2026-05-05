class ProxyService {
  constructor() {
    this.proxies = [];
    this.currentIndex = 0;
    this.initializeProxies();
  }

  initializeProxies() {
    const proxiesStr = process.env.YTDLP_PROXIES || '';
    if (proxiesStr) {
      this.proxies = proxiesStr.split(',').map(p => p.trim()).filter(Boolean);
      console.log(`[ProxyService] Initialized with ${this.proxies.length} proxies.`);
    } else if (process.env.YTDLP_PROXY) {
      this.proxies = [process.env.YTDLP_PROXY.trim()];
      console.log(`[ProxyService] Initialized with 1 proxy from legacy YTDLP_PROXY.`);
    } else {
      console.log(`[ProxyService] No proxies configured. Running direct connection.`);
    }
  }

  /**
   * Wrapper function that executes an action, and if it fails (likely due to bot detection),
   * it retries with the next available proxy until all proxies are exhausted.
   * 
   * @param {Function} actionFn - An async function that receives a `proxyUrl` string argument.
   * @returns {Promise<any>}
   */
  async executeWithFallback(actionFn) {
    if (this.proxies.length === 0) {
      // No proxies available, just run it without proxy
      return await actionFn('');
    }

    let attempts = 0;
    const maxAttempts = this.proxies.length;
    let lastError = null;

    while (attempts < maxAttempts) {
      const currentProxy = this.proxies[this.currentIndex];
      
      try {
        console.log(`[ProxyService] Attempt ${attempts + 1}/${maxAttempts} using proxy: ${currentProxy.split('@')[1] || currentProxy}`);
        const result = await actionFn(currentProxy);
        return result; // Success
      } catch (error) {
        lastError = error;
        
        // Identify if it's a bot block or just a generic proxy timeout
        const isBotBlock = error.message && (
          error.message.includes("Sign in to confirm you’re not a bot") ||
          error.message.includes("HTTP Error 403: Forbidden") ||
          error.message.includes("LOGIN_REQUIRED")
        );

        if (isBotBlock) {
          console.warn(`[ProxyService] Bot block detected on proxy ${currentProxy.split('@')[1] || currentProxy}. Rotating to next proxy...`);
        } else {
          console.warn(`[ProxyService] Proxy error or generic error on ${currentProxy.split('@')[1] || currentProxy}: ${error.message.substring(0, 100)}... Rotating...`);
        }

        // Rotate to the next proxy
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        attempts++;
      }
    }

    console.error(`[ProxyService] Exhausted all ${maxAttempts} proxies. Last error thrown.`);
    throw lastError;
  }
}

// Export a singleton instance
module.exports = new ProxyService();
