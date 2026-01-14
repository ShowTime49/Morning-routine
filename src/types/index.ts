export interface Child {
    id: number;
    name: string;
    brush: boolean;
    wash: boolean;
    dress: boolean;
}

export interface Announcement {
    id: number;
    message: string;
    time: string;
}

export type Phase = 'wake' | 'critical' | 'done';

export interface RoutineSettings {
    wakeTime: string; // HH:MM format
    criticalTime: string;
    endTime: string;
    soundEnabled: boolean;
    volume: number; // 0-1
}

export interface BluetoothDevice {
    id: string;
    name: string;
    connected: boolean;
}
