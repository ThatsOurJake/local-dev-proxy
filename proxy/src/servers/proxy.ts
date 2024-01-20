import Koa from 'koa';
import Router from 'koa-router';
import { randomUUID } from 'crypto';

import config from '../config';
import logger from '../logger';
import proxyRequest from '../services/proxy-request';

const app = new Koa();
const router = new Router();

router.all('/(.*)', async (ctx) => {
  const host = ctx.host;
  const correlationId = ctx.get('x-correlation-id') || randomUUID();

  logger.info({
    message: `Incoming - ${host} ${ctx.request.method} ${ctx.request.url}`,
    key: 'proxy.request',
    correlationId,
  });

  try {
    const res = await proxyRequest(ctx.request, correlationId);

    ctx.status = res.status;
    ctx.body = res.body;

    for (const [key, value] of res.headers.entries()) {
      ctx.set(key, value);
    }
  } catch (err) {
    const error = err as Error;
    logger.error({
      message: `Error handling request - ${error.message}`,
      key: 'proxy.request.error',
      correlationId,
      stack: error.stack,
    });

    ctx.body = {
      error: error.message,
    };

    ctx.status = 400;
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(config.ports.external, () => {
  logger.info({
    message: `Proxy server listening on port ${config.ports.external}`,
    key: 'proxy.started',
  });
});
