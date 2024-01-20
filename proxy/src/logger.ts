import type { LoggerTransport } from 'jino-client/dist/logger/transports';
import createServerLogger from 'jino-client/dist/server';

import config from './config';

const transports : LoggerTransport[] = config.isProduction ? ['console', 'http'] : ['console'];

const logger = createServerLogger({
  appName: 'local-dev-proxy',
  transports,
});

export default logger;
