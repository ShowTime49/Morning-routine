import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Child, Announcement, RoutineSettings, BluetoothDevice } from '@/types';
import {
    playCompleteSound,
    playAlarmSound,
    playUrgentSound,
    speak
} from '@/services/audioService';
import { requestBluetoothDevice } from '@/services/bluetoothService';
import { dataService } from '@/services/dataService';

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
    // Initial empty state, will populate from Firebase
    const [children, setChildren] = useState<Child[]>([]);

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const [settings, setSettings] = useState<RoutineSettings>(defaultSettings);

    const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);

    // --- Real-time Subscriptions --- //

    // Subscribe to Children changes
    useEffect(() => {
        const unsubscribe = dataService.subscribeToChildren((newChildren) => {
            setChildren(prevChildren => {
                // Check for completions to play sounds (Cross-device sync!)
                newChildren.forEach(newChild => {
                    const oldChild = prevChildren.find(c => c.id === newChild.id);
                    if (!oldChild) return;

                    (['brush', 'wash', 'dress'] as const).forEach(task => {
                        if (newChild[task] && !oldChild[task]) {
                            // Task just completed!
                            if (settings.soundEnabled) {
                                playCompleteSound(settings.volume);
                                const taskLabel = task === 'brush' ? 'brushing' : task === 'wash' ? 'washing' : 'dressing';
                                speak(`${newChild.name} finished ${taskLabel}! Great job.`);
                            }

                            const taskLabels = { brush: 'brushing teeth', wash: 'washing face', dress: 'getting dressed' };
                            addAnnouncement(`🎉 ${newChild.name} finished ${taskLabels[task]}!`);
                        }
                    });
                });
                return newChildren;
            });
        });

        return () => unsubscribe();
    }, [settings.soundEnabled, settings.volume]); // Re-subscribe if sound settings change to capture latest settings in closure

    // Subscribe to Settings changes
    useEffect(() => {
        const unsubscribe = dataService.subscribeToSettings((newSettings) => {
            setSettings(newSettings);
        });
        return () => unsubscribe();
    }, []);


    // --- Actions (Write to Firebase) --- //

    const addChild = (name: string) => {
        const newId = Math.max(0, ...children.map(c => c.id), 0) + 1;
        const newChildren = [...children, { id: newId, name, brush: false, wash: false, dress: false }];
        dataService.saveChildren(newChildren);
    };

    const removeChild = (id: number) => {
        const newChildren = children.filter(c => c.id !== id);
        dataService.saveChildren(newChildren);
    };

    const updateChildName = (id: number, name: string) => {
        const newChildren = children.map(c => c.id === id ? { ...c, name } : c);
        dataService.saveChildren(newChildren);
    };

    const toggleTask = (childId: number, task: 'brush' | 'wash' | 'dress') => {
        const child = children.find(c => c.id === childId);
        if (child) {
            // Optimistic update locally not needed strictly as listener is fast,
            // but we write to DB and let the listener update the UI
            dataService.toggleChildTask(childId, task, !child[task], children);
        }
    };

    const resetAllTasks = () => {
        const newChildren = children.map(c => ({ ...c, brush: false, wash: false, dress: false }));
        dataService.saveChildren(newChildren);
    };

    const updateSettings = (newSettings: Partial<RoutineSettings>) => {
        // Merge with existing settings
        const merged = { ...settings, ...newSettings };
        dataService.saveSettings(merged);
    };

    // --- Local Utils --- //

    const addAnnouncement = (message: string) => {
        const time = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        });
        setAnnouncements(prev => [...prev, { id: Date.now(), message, time }]);
    };

    const clearAnnouncements = () => setAnnouncements([]);

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
