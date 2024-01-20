import type { Request } from "koa";
import { parseDomain } from "../utils";
import connectionMap from "./connection-map";
import logger from "../logger";

const noPostBody = ['HEAD', 'GET'];

const validHeaders = ['content-type', 'accept', 'x-correlation-id'];

const proxyRequest = async (req: Request, correlationId: string) => {
  const domain = parseDomain(req.host);
  const connection = connectionMap.getConnection(domain);

  if (!connection) {
    throw new Error(`No connection found for "${domain}"`);
  }

  const { ipAddress } = connection;

  logger.info({
    message: `Proxying request to "${ipAddress}"`,
    key: "proxy.request.proxying",
    correlationId,
  });

  const headers: HeadersInit = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (validHeaders.includes(key.toLowerCase())) {
      headers.set(key, value as string);
    }
  }

  let res: Response;

  try {
    res = await fetch(`${ipAddress}${req.url}`, {
      method: req.method,
      body: noPostBody.includes(req.method) ? undefined : JSON.stringify(req.body || {}),
      headers,
    });
  } catch (err) {
    console.error(err);
    const error = err as Response;
    res = error;
  };

  return {
    status: res.status,
    body: await res.text(),
    headers: res.headers,
  }
};

export default proxyRequest;
