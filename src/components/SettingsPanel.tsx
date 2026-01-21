import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Settings,
    Clock,
    Volume2,
    VolumeX,
    Bluetooth,
    BluetoothConnected,
    UserPlus,
    RotateCcw,
    Save
} from 'lucide-react';
import { useRoutine } from '@/hooks/useRoutine';
import './SettingsPanel.css';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
    const {
        settings,
        updateSettings,
        addChild,
        resetAllTasks,
        bluetoothDevice,
        connectBluetooth,
        disconnectBluetooth,
        playSound,
    } = useRoutine();

    const [localSettings, setLocalSettings] = useState(settings);
    const [newChildName, setNewChildName] = useState('');

    const handleSave = () => {
        updateSettings(localSettings);
        playSound('complete');
        onClose();
    };

    const handleAddChild = () => {
        if (newChildName.trim()) {
            addChild(newChildName.trim());
            setNewChildName('');
            playSound('complete');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddChild();
        }
    };

    const handleTestSound = () => {
        playSound('complete');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="settings-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        className="settings-panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="settings-header">
                            <div className="settings-title-wrapper">
                                <Settings size={20} className="settings-icon" />
                                <h2 className="settings-title">Settings</h2>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="settings-content">
                            {/* Schedule Times */}
                            <section className="settings-section">
                                <h3 className="section-title">
                                    <Clock size={16} />
                                    Schedule Times
                                </h3>

                                <div className="settings-field">
                                    <label htmlFor="wakeTime">Wake Up Time</label>
                                    <input
                                        id="wakeTime"
                                        type="time"
                                        className="input"
                                        value={localSettings.wakeTime}
                                        onChange={(e) => setLocalSettings(s => ({ ...s, wakeTime: e.target.value }))}
                                    />
                                </div>

                                <div className="settings-field">
                                    <label htmlFor="criticalTime">Critical Time (Hurry!)</label>
                                    <input
                                        id="criticalTime"
                                        type="time"
                                        className="input"
                                        value={localSettings.criticalTime}
                                        onChange={(e) => setLocalSettings(s => ({ ...s, criticalTime: e.target.value }))}
                                    />
                                </div>

                                <div className="settings-field">
                                    <label htmlFor="endTime">Leave Time</label>
                                    <input
                                        id="endTime"
                                        type="time"
                                        className="input"
                                        value={localSettings.endTime}
                                        onChange={(e) => setLocalSettings(s => ({ ...s, endTime: e.target.value }))}
                                    />
                                </div>
                            </section>

                            {/* Audio Settings */}
                            <section className="settings-section">
                                <h3 className="section-title">
                                    {localSettings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                    Audio Alerts
                                </h3>

                                <div className="settings-field toggle-field">
                                    <label htmlFor="soundEnabled">Enable Sounds</label>
                                    <button
                                        id="soundEnabled"
                                        className={`toggle-btn ${localSettings.soundEnabled ? 'active' : ''}`}
                                        onClick={() => setLocalSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                                        type="button"
                                    >
                                        <span className="toggle-thumb" />
                                    </button>
                                </div>

                                {localSettings.soundEnabled && (
                                    <>
                                        <div className="settings-field">
                                            <label htmlFor="volume">Volume: {Math.round(localSettings.volume * 100)}%</label>
                                            <input
                                                id="volume"
                                                type="range"
                                                className="slider"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={localSettings.volume}
                                                onChange={(e) => setLocalSettings(s => ({ ...s, volume: parseFloat(e.target.value) }))}
                                            />
                                        </div>
                                        <button className="btn btn-secondary" onClick={handleTestSound} type="button">
                                            Test Sound
                                        </button>
                                    </>
                                )}
                            </section>

                            {/* Bluetooth */}
                            <section className="settings-section">
                                <h3 className="section-title">
                                    {bluetoothDevice?.connected ? <BluetoothConnected size={16} /> : <Bluetooth size={16} />}
                                    Bluetooth Speaker
                                </h3>

                                {bluetoothDevice?.connected ? (
                                    <div className="bluetooth-status">
                                        <div className="bluetooth-device">
                                            <BluetoothConnected size={18} className="connected-icon" />
                                            <span>{bluetoothDevice.name}</span>
                                        </div>
                                        <button className="btn btn-secondary" onClick={disconnectBluetooth} type="button">
                                            Disconnect
                                        </button>
                                    </div>
                                ) : (
                                    <button className="btn btn-primary" onClick={connectBluetooth} type="button">
                                        <Bluetooth size={16} />
                                        Connect Speaker
                                    </button>
                                )}
                                <p className="settings-hint">
                                    Connect a Bluetooth speaker for audio alerts. Make sure Bluetooth is enabled in your browser.
                                </p>
                            </section>

                            {/* Add Child */}
                            <section className="settings-section">
                                <h3 className="section-title">
                                    <UserPlus size={16} />
                                    Add Child
                                </h3>

                                <div className="add-child-form">
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Child's name"
                                        value={newChildName}
                                        onChange={(e) => setNewChildName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        maxLength={20}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleAddChild}
                                        disabled={!newChildName.trim()}
                                        type="button"
                                    >
                                        Add
                                    </button>
                                </div>
                            </section>

                            {/* Reset Tasks */}
                            <section className="settings-section">
                                <h3 className="section-title">
                                    <RotateCcw size={16} />
                                    Reset
                                </h3>
                                <button className="btn btn-secondary" onClick={resetAllTasks} type="button">
                                    Reset All Tasks
                                </button>
                                <p className="settings-hint">
                                    Uncheck all tasks for a new day.
                                </p>
                            </section>
                        </div>

                        <div className="settings-footer">
                            <button className="btn btn-secondary" onClick={onClose} type="button">
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSave} type="button">
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SettingsPanel;
