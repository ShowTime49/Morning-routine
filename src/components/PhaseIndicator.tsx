import { motion } from 'framer-motion';
import { Clock as ClockIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Clock from './Clock';
import { Phase } from '@/types';
import { useRoutine } from '@/context/RoutineContext';
import './PhaseIndicator.css';

interface PhaseIndicatorProps {
    currentTime: Date;
    currentPhase: Phase;
}

const phaseConfig = {
    wake: {
        label: 'Wake Up Time',
        description: 'Get ready for the day!',
        icon: ClockIcon,
        color: 'secondary',
    },
    critical: {
        label: 'Critical Time',
        description: 'Hurry! Time is running out!',
        icon: AlertTriangle,
        color: 'primary',
    },
    done: {
        label: 'All Done',
        description: 'Great job! Ready for school!',
        icon: CheckCircle2,
        color: 'success',
    },
};

const PhaseIndicator = ({ currentPhase }: PhaseIndicatorProps) => {
    const { settings } = useRoutine();
    const config = phaseConfig[currentPhase];
    const Icon = config.icon;

    const getProgress = () => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [wakeH, wakeM] = settings.wakeTime.split(':').map(Number);
        const [endH, endM] = settings.endTime.split(':').map(Number);

        const wakeMinutes = wakeH * 60 + wakeM;
        const endMinutes = endH * 60 + endM;

        if (currentMinutes < wakeMinutes) return 0;
        if (currentMinutes >= endMinutes) return 100;

        return Math.round(((currentMinutes - wakeMinutes) / (endMinutes - wakeMinutes)) * 100);
    };

    const progress = getProgress();

    return (
        <motion.div
            className={`phase-indicator phase-${currentPhase}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="phase-header">
                <div className="phase-info">
                    <div className={`phase-icon phase-icon-${config.color}`}>
                        <Icon size={24} />
                    </div>
                    <div className="phase-text">
                        <h2 className="phase-label">{config.label}</h2>
                        <p className="phase-description">{config.description}</p>
                    </div>
                </div>
                <Clock />
            </div>

            <div className="phase-progress-container">
                <div className="phase-progress-bar">
                    <motion.div
                        className={`phase-progress-fill progress-${config.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
                <span className="phase-progress-text">{progress}%</span>
            </div>

            <div className="phase-times">
                <span>Wake: {settings.wakeTime}</span>
                <span>Critical: {settings.criticalTime}</span>
                <span>End: {settings.endTime}</span>
            </div>
        </motion.div>
    );
};

export default PhaseIndicator;
