import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Clock.css';

interface ClockProps {
    className?: string;
}

const Clock = ({ className = '' }: ClockProps) => {
    const [time, setTime] = useState(new Date());
    const prevTimeRef = useRef<string>('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    const timeString = formatTime(time);
    const digits = timeString.split('');

    // Track which digits changed
    const prevTime = prevTimeRef.current;
    prevTimeRef.current = timeString;

    return (
        <div className={`clock-container ${className}`}>
            <div className="clock-display">
                {digits.map((digit, index) => {
                    const prevDigit = prevTime[index];
                    const changed = prevDigit !== undefined && prevDigit !== digit;

                    return (
                        <motion.span
                            key={index}
                            className={`clock-digit ${changed ? 'digit-changed' : ''}`}
                            initial={false}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.15,
                                ease: 'easeOut',
                            }}
                        >
                            {digit}
                        </motion.span>
                    );
                })}
            </div>
        </div>
    );
};

export default Clock;
