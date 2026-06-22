
import React, { useState, useEffect } from 'react';
import { Mode } from '../types.ts';

interface BootSequenceProps {
    onModeSelect: (mode: Mode) => void;
}

const bootLines = [
    "° . * . ° . * . ° . * . °",
    "/// PROPERTY OF HAWKINS MIDDLE SCHOOL ///",
    "/// HEATHKIT TERMINAL H-89 ///",
    "/// ENCRYPTED CHANNEL OPEN ///",
    "° . * . ° . * . ° . * . °",
    "",
    "SELECT OPERATOR MODE:"
];

const BootSequence: React.FC<BootSequenceProps> = ({ onModeSelect }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];
        bootLines.forEach((line, index) => {
            timeouts.push(setTimeout(() => {
                setLines(prev => [...prev, line]);
                if (index === bootLines.length - 1) {
                    setTimeout(() => setShowButtons(true), 300);
                }
            }, index * 400));
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
            <div className="text-center whitespace-pre-wrap">
                {lines.map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
            {showButtons && (
                <div className="mt-8 flex flex-col sm:flex-row gap-4 text-center animate-fadeIn">
                    <button
                        onClick={() => onModeSelect('child')}
                        className="px-6 py-2 border-2 border-current hover:bg-green-900/50 transition-colors duration-300"
                        aria-label="Select Child Mode"
                    >
                        [ CHILD ]
                    </button>
                    <button
                        onClick={() => onModeSelect('adult')}
                        className="px-6 py-2 border-2 border-current hover:bg-green-900/50 transition-colors duration-300"
                        aria-label="Select Adult Mode"
                    >
                        [ ADULT ]
                    </button>
                </div>
            )}
        </div>
    );
};

export default BootSequence;
