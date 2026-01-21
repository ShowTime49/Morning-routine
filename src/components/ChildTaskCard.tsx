import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Pencil, Trash2, X } from 'lucide-react';
import { Child } from '@/types';
import { useRoutine } from '@/hooks/useRoutine';
import ProgressRing from '@/components/ui/ProgressRing';
import './ChildTaskCard.css';

interface ChildTaskCardProps {
    child: Child;
    currentMinutes: number;
    onToggleTask: (childId: number, task: 'brush' | 'wash' | 'dress') => void;
}

const tasks: { key: 'brush' | 'wash' | 'dress'; label: string; emoji: string }[] = [
    { key: 'brush', label: 'Brush Teeth', emoji: '🦷' },
    { key: 'wash', label: 'Wash Face', emoji: '💧' },
    { key: 'dress', label: 'Get Dressed', emoji: '👕' },
];

const ChildTaskCard = ({ child, onToggleTask }: ChildTaskCardProps) => {
    const { updateChildName, removeChild } = useRoutine();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(child.name);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const completedCount = [child.brush, child.wash, child.dress].filter(Boolean).length;
    const progress = Math.round((completedCount / 3) * 100);
    const isComplete = completedCount === 3;

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSaveName = () => {
        if (editName.trim()) {
            updateChildName(child.id, editName.trim());
        } else {
            setEditName(child.name);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            setEditName(child.name);
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        removeChild(child.id);
        setShowDeleteConfirm(false);
    };

    return (
        <motion.div
            className={`child-card card ${isComplete ? 'child-complete' : ''}`}
            layout
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
        >
            <div className="child-header">
                <div className="child-info" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <ProgressRing
                        progress={progress}
                        label={`${completedCount}/3`}
                        size={56}
                        strokeWidth={5}
                        color={isComplete ? 'var(--color-success)' : 'var(--color-secondary)'}
                    />
                    <div>
                        {isEditing ? (
                            <div className="child-name-edit">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="input child-name-input"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={handleSaveName}
                                    onKeyDown={handleKeyDown}
                                    maxLength={20}
                                />
                            </div>
                        ) : (
                            <h3 className="child-name" onClick={() => setIsEditing(true)}>
                                {child.name}
                                <Pencil size={14} className="edit-icon" />
                            </h3>
                        )}
                    </div>
                </div>
                <div className="child-actions">
                    <AnimatePresence>
                        {isComplete && (
                            <motion.div
                                className="complete-badge"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                            >
                                <Sparkles size={16} />
                                <span>All Done!</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        className="btn btn-ghost btn-icon delete-btn"
                        onClick={() => setShowDeleteConfirm(true)}
                        title="Remove child"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="task-list">
                {tasks.map((task) => {
                    const isChecked = child[task.key];
                    return (
                        <motion.button
                            key={task.key}
                            className={`task-button ${isChecked ? 'task-complete' : ''}`}
                            onClick={() => onToggleTask(child.id, task.key)}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className={`task-checkbox ${isChecked ? 'checked' : ''}`}>
                                {isChecked && <Check size={14} strokeWidth={3} />}
                            </div>
                            <span className="task-emoji">{task.emoji}</span>
                            <span className="task-label">{task.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        className="delete-confirm-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            className="delete-confirm-dialog"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4>Remove {child.name}?</h4>
                            <p>This will remove them from the routine.</p>
                            <div className="confirm-buttons">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChildTaskCard;
