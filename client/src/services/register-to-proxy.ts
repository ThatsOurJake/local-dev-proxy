import config from "../config";

const registerToProxy = async (proxyAddress: string, localIpAddress: string, domain: string) => {
  const res = await fetch(`http://${proxyAddress}:${config.ports.proxy}/discovery`, {
    method: 'POST',
    body: JSON.stringify({
      domain: domain,
      ipAddress: `http://${localIpAddress}:${config.ports.local}`,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (res.ok) {
    return;
  }

  const json = await res.json();

  if (json.error) {
    throw new Error(json.error);
  }

  throw new Error(res.statusText);
};

export default registerToProxy;
