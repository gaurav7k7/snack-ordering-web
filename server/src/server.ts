import 'dotenv/config';

import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  await connectDatabase();

  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  });
}

void bootstrap().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
