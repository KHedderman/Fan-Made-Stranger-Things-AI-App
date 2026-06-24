import React, { useState, useEffect, useRef } from 'react';
import { Mode } from '../types.ts';
import { playKeyClick } from '../lib/keyClickSound';
import { playBootSound } from '../lib/bootSound';

interface BootSequenceProps {
    onModeSelect: (mode: Mode) => void;
}

const bootLines = [
    "° . * . ° . * . ° . * . °",
    "/// PROPERTY OF HAWKINS MIDDLE SCHOOL ///",
    "/// HEATHKIT ALL-IN-ONE COMPUTER MODEL H-89 ///",
    "/// ZENITH DATA SYSTEMS Z-89 // Z80 CPU // 48K RAM ///",
    "/// HEATH CO. · BENTON HARBOR, MICHIGAN · EST. 1926 ///",
    "/// ASSEMBLED BY HAWKINS AV CLUB — HENDERSON, D. ///",
    "/// ENCRYPTED CHANNEL OPEN ///",
    "° . * . ° . * . ° . * . °",
    "",
    "SELECT OPERATOR MODE:",
];

const CHAR_DELAY_MS = 22;
const LINE_PAUSE_MS = 180;

const BootSequence: React.FC<BootSequenceProps> = ({ onModeSelect }) => {
    const [lines, setLines] = useState<string[]>(['']);
    const [done, setDone] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const cancelledRef = useRef(false);

    useEffect(() => {
        cancelledRef.current = false;
        const stopBoot = playBootSound();
        let lineIdx = 0;
        let charIdx = 0;

        const tick = () => {
            if (cancelledRef.current) return;
            const current = bootLines[lineIdx];
            if (charIdx < current.length) {
                setLines((prev) => {
                    const next = [...prev];
                    next[lineIdx] = current.slice(0, charIdx + 1);
                    return next;
                });
                if (current[charIdx] && current[charIdx] !== ' ') {
                    playKeyClick();
                }
                charIdx++;
                setTimeout(tick, CHAR_DELAY_MS);
            } else {
                lineIdx++;
                charIdx = 0;
                if (lineIdx < bootLines.length) {
                    setLines((prev) => [...prev, '']);
                    setTimeout(tick, LINE_PAUSE_MS);
                } else {
                    setDone(true);
                    setTimeout(() => setShowButtons(true), 400);
                }
            }
        };

        const start = setTimeout(tick, 200);
        return () => {
            cancelledRef.current = true;
            clearTimeout(start);
            stopBoot();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
            <div className="text-center whitespace-pre-wrap">
                {lines.map((line, index) => {
                    const isLast = index === lines.length - 1;
                    return (
                        <p key={index}>
                            {line}
                            {isLast && (
                                <span className="animate-pulse ml-0.5" aria-hidden>
                                    _
                                </span>
                            )}
                        </p>
                    );
                })}
            </div>
            {done && showButtons && (
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
