import { IDevice } from "local-devices";
import config from "../config";

const findProxy = async (devices: IDevice[]) => {
  for (const device of devices) {
    console.log('Pinging', device.ip);

    try {
      const res = await fetch(`http://${device.ip}:${config.ports.proxy}/discovery`);

      if (!res.ok) {
        throw new Error('Not OK');
      }
  
      return device.ip;
    } catch (err) {}
  }
};

export default findProxy;
