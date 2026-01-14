import { HelpCircle, CheckCircle2 } from 'lucide-react';
import './InstructionsCard.css';

const instructions = [
    'Click on a child\'s name to edit it',
    'Tap tasks to mark them complete',
    'Use the settings gear to adjust times',
    'Add or remove children in settings',
    'Connect a Bluetooth speaker for alerts',
];

const InstructionsCard = () => {
    return (
        <div className="instructions-card card">
            <div className="instructions-header">
                <HelpCircle size={18} className="instructions-icon" />
                <h3 className="instructions-title">Quick Tips</h3>
            </div>

            <ul className="instructions-list">
                {instructions.map((instruction, index) => (
                    <li key={index} className="instruction-item">
                        <CheckCircle2 size={14} className="instruction-check" />
                        <span>{instruction}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InstructionsCard;
