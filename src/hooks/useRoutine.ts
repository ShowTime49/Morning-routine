import { useContext } from 'react';
import { RoutineContext } from '@/context/RoutineContext';

export function useRoutine() {
    const context = useContext(RoutineContext);
    if (!context) {
        throw new Error('useRoutine must be used within a RoutineProvider');
    }
    return context;
}
