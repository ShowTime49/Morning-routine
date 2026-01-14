import { motion } from 'framer-motion';
import { Clock, Utensils, BookOpen, Bus } from 'lucide-react';
import { useRoutine } from '@/context/RoutineContext';
import './TaskTimeline.css';

interface TimelineItem {
    time: string;
    label: string;
    icon: typeof Clock;
    status: 'past' | 'current' | 'future';
}

interface TaskTimelineProps {
    currentMinutes: number;
}

const TaskTimeline = ({ currentMinutes }: TaskTimelineProps) => {
    const { settings } = useRoutine();

    const parseTime = (timeStr: string): number => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const wakeMin = parseTime(settings.wakeTime);
    const critMin = parseTime(settings.criticalTime);
    const endMin = parseTime(settings.endTime);

    const getStatus = (itemMinutes: number): 'past' | 'current' | 'future' => {
        if (currentMinutes >= itemMinutes + 10) return 'past';
        if (currentMinutes >= itemMinutes - 5) return 'current';
        return 'future';
    };

    const timelineItems: TimelineItem[] = [
        { time: settings.wakeTime, label: 'Wake Up', icon: Clock, status: getStatus(wakeMin) },
        { time: `${Math.floor((wakeMin + 10) / 60).toString().padStart(2, '0')}:${((wakeMin + 10) % 60).toString().padStart(2, '0')}`, label: 'Breakfast', icon: Utensils, status: getStatus(wakeMin + 10) },
        { time: settings.criticalTime, label: 'Get Ready', icon: BookOpen, status: getStatus(critMin) },
        { time: settings.endTime, label: 'Leave for School', icon: Bus, status: getStatus(endMin) },
    ];

    return (
        <div className="task-timeline card">
            <h3 className="timeline-title">Today's Schedule</h3>
            <div className="timeline-container">
                {timelineItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={index}
                            className={`timeline-item timeline-${item.status}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="timeline-dot">
                                <Icon size={16} />
                            </div>
                            {index < timelineItems.length - 1 && <div className="timeline-line" />}
                            <div className="timeline-content">
                                <span className="timeline-time">{item.time}</span>
                                <span className="timeline-label">{item.label}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskTimeline;
