import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Settings } from 'lucide-react';
import PhaseIndicator from '@/components/PhaseIndicator';
import TaskTimeline from '@/components/TaskTimeline';
import ChildTaskCard from '@/components/ChildTaskCard';
import AnnouncementLog from '@/components/AnnouncementLog';
import InstructionsCard from '@/components/InstructionsCard';
import SettingsPanel from '@/components/SettingsPanel';
import { useRoutine } from '@/hooks/useRoutine';
import { Phase } from '@/types';
import './Index.css';

const Index = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPhase, setCurrentPhase] = useState<Phase>('wake');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [alarmTriggered, setAlarmTriggered] = useState(false);

    const { children, toggleTask, settings, addAnnouncement, playSound } = useRoutine();

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Parse time string to minutes
    const parseTime = (timeStr: string): number => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    // Determine current phase based on time
    useEffect(() => {
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const wakeMin = parseTime(settings.wakeTime);
        const critMin = parseTime(settings.criticalTime);
        const endMin = parseTime(settings.endTime);

        if (currentMinutes >= wakeMin && currentMinutes < critMin) {
            setCurrentPhase('wake');
            // Trigger wake alarm once
            if (!alarmTriggered && currentMinutes >= wakeMin && currentMinutes < wakeMin + 1) {
                playSound('alarm');
                addAnnouncement('⏰ Good morning! Time to wake up!');
                setAlarmTriggered(true);
            }
        } else if (currentMinutes >= critMin && currentMinutes < endMin) {
            setCurrentPhase('critical');
            // Play urgent sound at critical time start
            if (currentMinutes === critMin && currentTime.getSeconds() < 2) {
                playSound('urgent');
                addAnnouncement('⚠️ Critical time! Hurry up!');
            }
        } else {
            setCurrentPhase('done');
        }
    }, [currentTime, settings, alarmTriggered, playSound, addAnnouncement]);

    // Reset alarm trigger at midnight
    useEffect(() => {
        const checkMidnight = setInterval(() => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                setAlarmTriggered(false);
            }
        }, 60000);
        return () => clearInterval(checkMidnight);
    }, []);

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    return (
        <div className="app-container">
            {/* Ambient background gradient */}
            <div className="ambient-bg" />

            <div className="main-content">
                {/* Header */}
                <motion.header
                    className="app-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-left">
                        <div className="header-icon">
                            <Sunrise className="sunrise-icon" />
                        </div>
                        <div className="header-text">
                            <h1 className="app-title">Morning Routine</h1>
                            <p className="app-subtitle">Keep your family on track every morning</p>
                        </div>
                    </div>
                    <button
                        className="btn btn-ghost btn-icon settings-btn"
                        onClick={() => setSettingsOpen(true)}
                        aria-label="Open settings"
                    >
                        <Settings size={24} />
                    </button>
                </motion.header>

                {/* Main Content Grid */}
                <div className="content-grid">
                    {/* Phase Indicator */}
                    <PhaseIndicator
                        currentTime={currentTime}
                        currentPhase={currentPhase}
                    />

                    {/* Two Column Layout */}
                    <div className="two-column-grid">
                        {/* Task Timeline - Takes 1 column */}
                        <div className="timeline-column">
                            <TaskTimeline currentMinutes={currentMinutes} />
                        </div>

                        {/* Children Cards - Takes 2 columns */}
                        <div className="children-column">
                            {children.length === 0 ? (
                                <div className="no-children card">
                                    <p>No children added yet.</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setSettingsOpen(true)}
                                    >
                                        Add a Child
                                    </button>
                                </div>
                            ) : (
                                children.map((child, index) => (
                                    <motion.div
                                        key={child.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <ChildTaskCard
                                            child={child}
                                            currentMinutes={currentMinutes}
                                            onToggleTask={toggleTask}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="bottom-grid">
                        <AnnouncementLog />
                        <InstructionsCard />
                    </div>
                </div>

                {/* Footer */}
                <motion.footer
                    className="app-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Built for busy mornings ☀️
                </motion.footer>
            </div>

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
        </div>
    );
};

export default Index;
