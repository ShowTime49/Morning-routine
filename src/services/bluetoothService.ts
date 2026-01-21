import { BluetoothDevice } from '@/types';

export const requestBluetoothDevice = async (): Promise<BluetoothDevice | null> => {
    const nav = navigator as Navigator & {
        bluetooth?: {
            requestDevice: (options: { acceptAllDevices: boolean; optionalServices: string[] }) => Promise<{
                id: string;
                name?: string;
                addEventListener: (event: string, handler: () => void) => void
            }>
        }
    };

    if (!nav.bluetooth) {
        throw new Error('Bluetooth not supported');
    }

    const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access'],
    });

    return {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: true,
        // Store reference for manual disconnect if needed
        _rawDevice: device
    } as any;
};
