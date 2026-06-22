import React, { useEffect, useState } from 'react';
import { getApiKey, setApiKey, clearApiKey } from '../lib/apiKeyStorage';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
    const [value, setValue] = useState('');
    const [reveal, setReveal] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (open) {
            setValue(getApiKey() ?? '');
            setSaved(false);
        }
    }, [open]);

    if (!open) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        setApiKey(value);
        setSaved(true);
        setTimeout(() => onClose(), 600);
    };

    const handleClear = () => {
        clearApiKey();
        setValue('');
        setSaved(false);
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl border-2 border-current bg-black p-6 text-xl md:text-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="tracking-wider">/// SETTINGS ///</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close settings"
                        className="border-2 border-current px-3 py-1 hover:bg-green-900/50"
                    >
                        [ X ]
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <label className="block">
                        <span className="block mb-2">GOOGLE GEMINI API KEY:</span>
                        <div className="flex items-center gap-2">
                            <input
                                type={reveal ? 'text' : 'password'}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Paste your key (e.g. AIza...)"
                                className="flex-1 bg-transparent border-2 border-current px-3 py-2 focus:outline-none placeholder-green-800"
                                autoComplete="off"
                                spellCheck={false}
                                aria-label="Gemini API key"
                            />
                            <button
                                type="button"
                                onClick={() => setReveal((r) => !r)}
                                className="border-2 border-current px-3 py-2 hover:bg-green-900/50"
                                aria-label={reveal ? 'Hide API key' : 'Show API key'}
                            >
                                {reveal ? '[ HIDE ]' : '[ SHOW ]'}
                            </button>
                        </div>
                    </label>

                    <p className="text-base md:text-lg text-green-500/90 leading-snug">
                        Your API key is stored only in your local browser and is never shared with
                        the application developer or any server.
                    </p>

                    <p className="text-base md:text-lg">
                        Get a free key at{' '}
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="underline hover:bg-green-900/50"
                        >
                            aistudio.google.com/app/apikey
                        </a>
                        .
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            type="submit"
                            className="border-2 border-current px-4 py-2 hover:bg-green-900/50 disabled:opacity-50"
                            disabled={!value.trim()}
                        >
                            [ SAVE ]
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="border-2 border-current px-4 py-2 hover:bg-green-900/50"
                        >
                            [ CLEAR ]
                        </button>
                        {saved && <span className="self-center">// SAVED //</span>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsModal;
