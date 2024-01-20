import inquirer from 'inquirer';
import ip from 'ip';

import { getLocalDevices } from './services/local-devices';
import findProxy from './services/find-proxy';
import startLocalProxy from './services/local-proxy';
import registerToProxy from './services/register-to-proxy';

interface Prompts {
  domain: string;
  port: number;
}

(async () => {
  console.log('Finding local devices');

  const devices = await getLocalDevices();

  if (!devices) {
    return;
  }

  if (devices.length === 0) {
    console.warn('No local devices found');
    return;
  }

  console.log(`Found ${devices.length} devices - Entering discovery`);

  const proxyServer = await findProxy(devices);

  if (!proxyServer) {
    console.warn('No proxy server found - is it deployed to your local network?');
    return;
  }

  console.log(`Found Proxy server at ${proxyServer}`);

  const answers = await inquirer.prompt<Prompts>([
    {
      type: 'input',
      name: 'domain',
      message: 'Enter the domain to proxy',
    },
    {
      type: 'number',
      name: 'port',
      message: 'Enter the port to proxy to',
    },
  ]);

  const { domain, port } = answers;
  const localIP = ip.address();

  console.log(`Registering ${localIP} => ${domain}`);

  try {
    await registerToProxy(proxyServer, localIP, domain);
  } catch (err) {
    const error = err as Error;
    console.error(`Error registering with proxy - ${error.message}`);
    return;
  }

  // Start ping loop
  startLocalProxy({ proxyPort: port });
})();
