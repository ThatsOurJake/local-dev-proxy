import logger from "../logger";

interface Connection {
  ipAddress: string;
  lastPing: number;
}

const connections: Map<string, Connection> = new Map();

const addConnection = (domain: string, ipAddress: string) => {
  if (connections.has(domain)) {
    throw new Error(`Connection for "${domain}" already exists`);
  }

  connections.set(domain, {
    ipAddress,
    lastPing: Date.now(),
  });
};

const removeConnection = (domain: string) => {
  connections.delete(domain);
};

const getConnection = (domain: string) => {
  return connections.get(domain);
};

const pingConnection = (domain: string) => {
  const connection = getConnection(domain);

  if (!connection) {
    logger.error({
      message: `Connection for "${domain}" is not found`,
      key: 'discovery.domain-not-found',
    });
    return;
  }

  connection.lastPing = Date.now();
};

export default {
  addConnection,
  removeConnection,
  getConnection,
  pingConnection,
};
