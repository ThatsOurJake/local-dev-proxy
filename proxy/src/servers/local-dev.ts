import Koa from "koa";
import Router from "koa-router";

import config from "../config";
import logger from "../logger";

const startLocalDevServer = () => {
  if (config.isProduction) {
    return;
  }

  const devPort = config.ports.external + 1;

  const app = new Koa();
  const router = new Router();

  router.get("/test", (ctx) => {
    ctx.body = {
      foo: 'bar',
    };

    ctx.set('x-test-header', 'test');
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(devPort, () => {
    logger.info({
      message: `Local dev server listening on port ${devPort}`,
      key: "local-dev.started",
    });
  });
};

export default startLocalDevServer();
