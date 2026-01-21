import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Child, Announcement, RoutineSettings, BluetoothDevice } from '@/types';
import {
    playCompleteSound,
    playAlarmSound,
    playUrgentSound,
    speak
} from '@/services/audioService';
import { requestBluetoothDevice } from '@/services/bluetoothService';

interface RoutineContextType {
    children: Child[];
    setChildren: React.Dispatch<React.SetStateAction<Child[]>>;
    addChild: (name: string) => void;
    removeChild: (id: number) => void;
    updateChildName: (id: number, name: string) => void;
    toggleTask: (childId: number, task: 'brush' | 'wash' | 'dress') => void;
    resetAllTasks: () => void;

    announcements: Announcement[];
    addAnnouncement: (message: string) => void;
    clearAnnouncements: () => void;

    settings: RoutineSettings;
    updateSettings: (settings: Partial<RoutineSettings>) => void;

    bluetoothDevice: BluetoothDevice | null;
    connectBluetooth: () => Promise<void>;
    disconnectBluetooth: () => void;

    playSound: (type: 'complete' | 'alarm' | 'urgent') => void;
    getRoutineStatus: () => 'ON_TRACK' | 'URGENT' | 'LATE';
}

const defaultSettings: RoutineSettings = {
    wakeTime: '06:45',
    criticalTime: '07:10',
    endTime: '07:25',
    soundEnabled: true,
    volume: 0.7,
};

export const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export function RoutineProvider({ children: childrenProp }: { children: ReactNode }) {
    // Load from localStorage or use defaults
    const [children, setChildren] = useState<Child[]>(() => {
        const saved = localStorage.getItem('routine-children');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Emma', brush: false, wash: false, dress: false },
            { id: 2, name: 'Oliver', brush: false, wash: false, dress: false },
        ];
    });

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const [settings, setSettings] = useState<RoutineSettings>(() => {
        const saved = localStorage.getItem('routine-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    });

    const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);

    // Persistence effects
    useEffect(() => {
        const savedChildren = localStorage.getItem('routine-children');
        if (savedChildren) {
            try {
                setChildren(JSON.parse(savedChildren));
            } catch (e) {
                console.error('Failed to parse saved children', e);
            }
        }
    }, []); // Run once on mount

    useEffect(() => {
        localStorage.setItem('routine-children', JSON.stringify(children));
    }, [children]);

    useEffect(() => {
        localStorage.setItem('routine-settings', JSON.stringify(settings));
    }, [settings]);

    const addChild = (name: string) => {
        const newId = Math.max(0, ...children.map(c => c.id)) + 1;
        setChildren(prev => [...prev, { id: newId, name, brush: false, wash: false, dress: false }]);
    };

    const removeChild = (id: number) => {
        setChildren(prev => prev.filter(c => c.id !== id));
    };

    const updateChildName = (id: number, name: string) => {
        setChildren(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    };

    const toggleTask = (childId: number, task: 'brush' | 'wash' | 'dress') => {
        setChildren(prev => {
            const newState = prev.map(c => c.id === childId ? { ...c, [task]: !c[task] } : c);

            const child = newState.find(c => c.id === childId);
            const originalChild = prev.find(c => c.id === childId);
            const wasComplete = originalChild ? originalChild[task] : false;

            // Voice Feedback & Sounds
            if (child && child[task] && !wasComplete) {
                if (settings.soundEnabled) {
                    playCompleteSound(settings.volume);
                    const taskLabel = task === 'brush' ? 'brushing' : task === 'wash' ? 'washing' : 'dressing';
                    speak(`${child.name} finished ${taskLabel}! Great job.`);
                }

                const taskLabels = { brush: 'brushing teeth', wash: 'washing face', dress: 'getting dressed' };
                addAnnouncement(`🎉 ${child.name} finished ${taskLabels[task]}!`);
            }

            return newState;
        });
    };

    const resetAllTasks = () => {
        setChildren(prev => prev.map(c => ({ ...c, brush: false, wash: false, dress: false })));
    };

    const addAnnouncement = (message: string) => {
        const time = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        });
        setAnnouncements(prev => [...prev, { id: Date.now(), message, time }]);
    };

    const clearAnnouncements = () => setAnnouncements([]);

    const updateSettings = (newSettings: Partial<RoutineSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const playSound = (type: 'complete' | 'alarm' | 'urgent') => {
        if (!settings.soundEnabled) return;
        switch (type) {
            case 'complete': playCompleteSound(settings.volume); break;
            case 'alarm': playAlarmSound(settings.volume); break;
            case 'urgent': playUrgentSound(settings.volume); break;
        }
    };

    const getRoutineStatus = (): 'ON_TRACK' | 'URGENT' | 'LATE' => {
        const now = new Date();
        const [critH, critM] = settings.criticalTime.split(':').map(Number);
        const critical = new Date();
        critical.setHours(critH, critM, 0);

        const diffInMinutes = Math.floor((critical.getTime() - now.getTime()) / 60000);

        if (diffInMinutes < 0) return 'LATE';
        if (diffInMinutes < 10) return 'URGENT';
        return 'ON_TRACK';
    };

    const connectBluetooth = async () => {
        try {
            const device = await requestBluetoothDevice();
            if (device) {
                setBluetoothDevice(device);
                addAnnouncement(`🔗 Connected to ${device.name}`);

                const raw = (device as any)._rawDevice;
                if (raw) {
                    raw.addEventListener('gattserverdisconnected', () => {
                        setBluetoothDevice(prev => prev ? { ...prev, connected: false } : null);
                        addAnnouncement('📡 Bluetooth device disconnected');
                    });
                }
            }
        } catch (error) {
            addAnnouncement(`❌ Bluetooth Error: ${(error as Error).message}`);
        }
    };

    const disconnectBluetooth = () => {
        setBluetoothDevice(null);
        addAnnouncement('📡 Bluetooth disconnected');
    };

    return (
        <RoutineContext.Provider
            value={{
                children, setChildren, addChild, removeChild, updateChildName, toggleTask, resetAllTasks,
                announcements, addAnnouncement, clearAnnouncements,
                settings, updateSettings,
                bluetoothDevice, connectBluetooth, disconnectBluetooth,
                playSound, getRoutineStatus,
            }}
        >
            {childrenProp}
        </RoutineContext.Provider>
    );
}
