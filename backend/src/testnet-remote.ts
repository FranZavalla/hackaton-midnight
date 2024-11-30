import { createLogger } from './logger-utils.js';
import { run } from './index.ts';
import { TestnetRemoteConfig } from './config.ts';

const config = new TestnetRemoteConfig();
config.setNetworkId();
const logger = await createLogger(config.logDir);
await run(config, logger);
