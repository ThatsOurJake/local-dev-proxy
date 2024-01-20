import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';

import config from '../config';
import logger from '../logger';
import connectionMap from '../services/connection-map';

const app = new Koa();
const router = new Router();

app.use(bodyParser());

interface DiscoveryDIO {
  domain: string;
  ipAddress: string;
}

router.get('/discovery', (ctx) => {
  ctx.body = {
    result: 'ok'
  };
});

router.post('/discovery', (ctx) => {
  const { domain, ipAddress } = ctx.request.body as DiscoveryDIO;

  if (!domain) {
    ctx.status = 400;
    ctx.body = {
      error: 'Domain is required',
    };
    return;
  }

  if (!ipAddress) {
    ctx.status = 400;
    ctx.body = {
      error: 'IP address is required',
    };
  }

  if (!ipAddress.startsWith('http://') && !ipAddress.startsWith('https://')) {
    ctx.status = 400;
    ctx.body = {
      error: 'Domain must start with http:// or https://',
    };
    return;
  }

  logger.info({
    message: `Registering ${ipAddress} => ${domain}`,
    key: 'discovery.register',
  });

  try {
    connectionMap.addConnection(domain, ipAddress);

    ctx.body = {
      result: 'Registered',
    }
    ctx.status = 201;
  } catch (err) {
    const error = err as Error;

    logger.error({
      key: 'discovery.register-failed',
      message: error.message,
      stack: error.stack,
    });

    ctx.status = 400;
    ctx.body = {
      error: error.message,
    };
  }
});

router.use(async (ctx, next) => {
  const domain = ctx.get('x-domain');

  if (domain) {
    ctx.state.domain = domain;
    return next();
  }

  ctx.status = 400;
  ctx.body = {
    error: 'Domain header is required',
  };
})

router.get('/ping', (ctx) => {
  logger.debug({
    message: `Ping Received - ${ctx.state.domain}`,
    key: 'discovery.ping',
  });

  connectionMap.pingConnection(ctx.state.domain);

  ctx.body = {
    result: 'pong',
  };
});

router.delete('/discovery', (ctx) => {
  logger.info({
    message: `Removing connection for ${ctx.state.domain}`,
    key: 'discovery.remove',
  });

  connectionMap.removeConnection(ctx.state.domain);

  ctx.status = 204;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(config.ports.internal, () => {
  logger.info({
    message: `Discovery server listening on port ${config.ports.internal}`,
    key: 'discovery.started',
  });
});
