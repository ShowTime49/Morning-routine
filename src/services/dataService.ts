import { ref, onValue, set, update, get } from "firebase/database";
import { db } from "./firebase";
import { Child, RoutineSettings } from "@/types";

// Base reference paths
const CHILDREN_REF = 'children';
const SETTINGS_REF = 'settings';

export const dataService = {
    // --- CHILDREN OPERATIONS ---

    // Subscribe to children updates
    subscribeToChildren: (callback: (children: Child[]) => void) => {
        const childrenRef = ref(db, CHILDREN_REF);
        return onValue(childrenRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                callback(data);
            } else {
                // Initialize if empty
                const initialChildren = [
                    { id: 1, name: 'Emma', brush: false, wash: false, dress: false },
                    { id: 2, name: 'Oliver', brush: false, wash: false, dress: false },
                ];
                set(childrenRef, initialChildren);
                callback(initialChildren);
            }
        });
    },

    // Save all children (used for adding/removing)
    saveChildren: (children: Child[]) => {
        return set(ref(db, CHILDREN_REF), children);
    },

    // Update a single task for a child (Optimized for minimal bandwidth)
    toggleChildTask: async (childId: number, task: 'brush' | 'wash' | 'dress', newValue: boolean, currentChildren: Child[]) => {
        // Find index of child
        const childIndex = currentChildren.findIndex(c => c.id === childId);
        if (childIndex === -1) return;

        // Update specific path: children/0/brush
        const taskRef = ref(db, `${CHILDREN_REF}/${childIndex}/${task}`);
        return set(taskRef, newValue);
    },

    // --- SETTINGS OPERATIONS ---

    subscribeToSettings: (callback: (settings: RoutineSettings) => void) => {
        const settingsRef = ref(db, SETTINGS_REF);
        return onValue(settingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                callback(data);
            } else {
                // Initialize defaults if missing
                const defaultSettings: RoutineSettings = {
                    wakeTime: '06:45',
                    criticalTime: '07:10',
                    endTime: '07:25',
                    soundEnabled: true,
                    volume: 0.7,
                };
                set(settingsRef, defaultSettings);
                callback(defaultSettings);
            }
        });
    },

    saveSettings: (settings: RoutineSettings) => {
        return set(ref(db, SETTINGS_REF), settings);
    }
};
