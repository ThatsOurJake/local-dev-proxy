import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';

import config from '../config';

interface BootstrapOptions {
  proxyPort: number;
}

const noPostBody = ['HEAD', 'GET'];

const validHeaders = ['content-type', 'accept', 'x-correlation-id'];

const processCtxHeaders = (ctx: Koa.Context) => {
  const headers: HeadersInit = new Headers();

  for (const [key, value] of Object.entries(ctx.req.headers)) {
    if (validHeaders.includes(key.toLowerCase())) {
      headers.set(key, value as string);
    }
  }

  return headers;
};

const startLocalProxy = (opts: BootstrapOptions) => {
  const app = new Koa();
  app.use(bodyParser());

  const router = new Router();

  router.all('/(.*)', async (ctx) => {
    const { proxyPort } = opts;
    const { path, request: req } = ctx;

    const url = `http://localhost:${proxyPort}${path}`;
    console.log(`Proxying request to ${url}`);

    let res: Response;

    try {
      res = await fetch(url, {
        method: ctx.method,
        body: noPostBody.includes(req.method) ? undefined : JSON.stringify(req.body || {}),
        headers: processCtxHeaders(ctx),
      });
    } catch (err) {
      console.log(err);
      const error = err as Response;
      res = error;
    }

    ctx.status = res.status;
    ctx.body = await res.text();
    
    for (const [key, value] of res.headers.entries()) {
      ctx.set(key, value);
    }
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(config.ports.local, () => {
    console.log(`Local proxy listening on port ${config.ports.local}`);
  });
};

export default startLocalProxy;
