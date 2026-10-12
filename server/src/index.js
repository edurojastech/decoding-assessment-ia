import { config } from './config.js';
import { createApp } from './app.js';
import { syncDatabase } from './models/index.js';
import { seedIfEmpty } from './seed/seed.js';

await syncDatabase();
if (await seedIfEmpty()) {
  console.log('[seed] Banco novo: dados de demonstração criados.');
}

const app = createApp();
app.listen(config.port, config.host, () => {
  console.log(`[server] Ouvindo em http://${config.host}:${config.port}`);
});
