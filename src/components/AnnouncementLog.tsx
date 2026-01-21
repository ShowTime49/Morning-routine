import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2 } from 'lucide-react';
import { useRoutine } from '@/hooks/useRoutine';
import './AnnouncementLog.css';

const AnnouncementLog = () => {
    const { announcements, clearAnnouncements } = useRoutine();

    return (
        <div className="announcement-log card">
            <div className="log-header">
                <div className="log-title-wrapper">
                    <Bell size={18} className="log-icon" />
                    <h3 className="log-title">Announcements</h3>
                </div>
                {announcements.length > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={clearAnnouncements}>
                        <Trash2 size={14} />
                        Clear
                    </button>
                )}
            </div>

            <div className="log-container">
                {announcements.length === 0 ? (
                    <p className="log-empty">No announcements yet</p>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {announcements.slice().reverse().map((announcement) => (
                            <motion.div
                                key={announcement.id}
                                className="log-item"
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className="log-time">{announcement.time}</span>
                                <span className="log-message">{announcement.message}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default AnnouncementLog;
