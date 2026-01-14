import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Child, Announcement, RoutineSettings, BluetoothDevice } from '@/types';

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
}

const defaultSettings: RoutineSettings = {
    wakeTime: '06:45',
    criticalTime: '07:10',
    endTime: '07:25',
    soundEnabled: true,
    volume: 0.7,
};

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

// Audio context for playing sounds
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContext;
};

// Generate sounds programmatically
const playTone = (frequency: number, duration: number, volume: number, type: OscillatorType = 'sine') => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
};

const playCompleteSound = (volume: number) => {
    // Pleasant ascending chime
    playTone(523.25, 0.15, volume); // C5
    setTimeout(() => playTone(659.25, 0.15, volume), 100); // E5
    setTimeout(() => playTone(783.99, 0.3, volume), 200); // G5
};

const playAlarmSound = (volume: number) => {
    // Gentle wake-up melody
    playTone(440, 0.2, volume); // A4
    setTimeout(() => playTone(523.25, 0.2, volume), 250); // C5
    setTimeout(() => playTone(659.25, 0.2, volume), 500); // E5
    setTimeout(() => playTone(783.99, 0.4, volume), 750); // G5
};

const playUrgentSound = (volume: number) => {
    // Attention-grabbing alert
    playTone(880, 0.1, volume, 'square'); // A5
    setTimeout(() => playTone(988, 0.1, volume, 'square'), 150); // B5
    setTimeout(() => playTone(880, 0.1, volume, 'square'), 300); // A5
    setTimeout(() => playTone(988, 0.1, volume, 'square'), 450); // B5
};

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

    // Persist children to localStorage
    useEffect(() => {
        localStorage.setItem('routine-children', JSON.stringify(children));
    }, [children]);

    // Persist settings to localStorage
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
        const child = children.find(c => c.id === childId);
        const wasComplete = child ? child[task] : false;

        setChildren(prev =>
            prev.map(c => c.id === childId ? { ...c, [task]: !c[task] } : c)
        );

        // Play sound when completing a task (not when unchecking)
        if (!wasComplete && settings.soundEnabled) {
            playSound('complete');
            const taskLabels = { brush: 'brushing teeth', wash: 'washing face', dress: 'getting dressed' };
            if (child) {
                addAnnouncement(`🎉 ${child.name} finished ${taskLabels[task]}!`);
            }
        }
    };

    const resetAllTasks = () => {
        setChildren(prev => prev.map(c => ({ ...c, brush: false, wash: false, dress: false })));
    };

    const addAnnouncement = (message: string) => {
        const time = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
        setAnnouncements(prev => [...prev, { id: Date.now(), message, time }]);
    };

    const clearAnnouncements = () => {
        setAnnouncements([]);
    };

    const updateSettings = (newSettings: Partial<RoutineSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const playSound = (type: 'complete' | 'alarm' | 'urgent') => {
        if (!settings.soundEnabled) return;

        switch (type) {
            case 'complete':
                playCompleteSound(settings.volume);
                break;
            case 'alarm':
                playAlarmSound(settings.volume);
                break;
            case 'urgent':
                playUrgentSound(settings.volume);
                break;
        }
    };

    const connectBluetooth = async () => {
        const nav = navigator as Navigator & { bluetooth?: { requestDevice: (options: { acceptAllDevices: boolean; optionalServices: string[] }) => Promise<{ id: string; name?: string; addEventListener: (event: string, handler: () => void) => void }> } };
        if (!nav.bluetooth) {
            addAnnouncement('⚠️ Bluetooth not supported in this browser');
            return;
        }

        try {
            const device = await nav.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['generic_access'],
            });

            setBluetoothDevice({
                id: device.id,
                name: device.name || 'Unknown Device',
                connected: true,
            });

            addAnnouncement(`🔗 Connected to ${device.name || 'Bluetooth device'}`);

            device.addEventListener('gattserverdisconnected', () => {
                setBluetoothDevice(prev => prev ? { ...prev, connected: false } : null);
                addAnnouncement('📡 Bluetooth device disconnected');
            });
        } catch (error) {
            if ((error as Error).name !== 'NotFoundError') {
                addAnnouncement('❌ Failed to connect to Bluetooth device');
            }
        }
    };

    const disconnectBluetooth = () => {
        setBluetoothDevice(null);
        addAnnouncement('📡 Bluetooth disconnected');
    };

    return (
        <RoutineContext.Provider
            value={{
                children,
                setChildren,
                addChild,
                removeChild,
                updateChildName,
                toggleTask,
                resetAllTasks,
                announcements,
                addAnnouncement,
                clearAnnouncements,
                settings,
                updateSettings,
                bluetoothDevice,
                connectBluetooth,
                disconnectBluetooth,
                playSound,
            }}
        >
            {childrenProp}
        </RoutineContext.Provider>
    );
}

export function useRoutine() {
    const context = useContext(RoutineContext);
    if (!context) {
        throw new Error('useRoutine must be used within a RoutineProvider');
    }
    return context;
}
