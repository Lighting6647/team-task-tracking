import { preview } from 'vite'

const port = Number.parseInt(process.env.PORT ?? '4173', 10)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`)
}

const server = await preview({
  preview: {
    host: '0.0.0.0',
    port,
    strictPort: true,
  },
})

server.printUrls()

// Keep-Alive Service: Prevents cloud hosting (such as Render.com free tier) from sleeping
const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || process.env.KEEP_ALIVE_URL;
const pingIntervalMinutes = Number.parseInt(process.env.PING_INTERVAL_MINUTES ?? '10', 10);

if (keepAliveUrl) {
  console.log(`[Keep-Alive] Configured for ${keepAliveUrl}. Pinging every ${pingIntervalMinutes}m to prevent sleep.`);
  setInterval(async () => {
    try {
      const res = await fetch(keepAliveUrl);
      console.log(`[Keep-Alive] Pinged ${keepAliveUrl} - Status: ${res.status} (${new Date().toLocaleTimeString('th-TH')})`);
    } catch (err) {
      console.warn(`[Keep-Alive] Ping attempt warning:`, err.message);
    }
  }, pingIntervalMinutes * 60 * 1000);
} else {
  console.log('[Keep-Alive] Ready. Set RENDER_EXTERNAL_URL or KEEP_ALIVE_URL to enable automated cloud keep-alive.');
}
