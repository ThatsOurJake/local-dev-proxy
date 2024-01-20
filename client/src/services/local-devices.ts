import findLocalDevices, { type IDevice } from 'local-devices';

export const getLocalDevices = async () => {
  try {
    const devices = await findLocalDevices();

    const res: IDevice[] = [
      {
        ip: '127.0.0.1',
        name: 'localhost',
        mac: '00:00:00:00:00:00',
      },
      ...devices,
    ];

    return res;
  } catch (err) {
    console.error('Error finding local devices - have you installed ARP?');
  }
};
