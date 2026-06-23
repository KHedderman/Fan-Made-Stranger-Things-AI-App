import React, { useEffect, useState } from 'react';
import {
    getApiKey,
    setApiKey,
    clearApiKey,
    getModel,
    setModel,
    SUPPORTED_MODELS,
    type GeminiModelId,
} from '../lib/apiKeyStorage';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
    const [value, setValue] = useState('');
    const [reveal, setReveal] = useState(false);
    const [saved, setSaved] = useState(false);
    const [model, setModelState] = useState<GeminiModelId>(getModel());

    useEffect(() => {
        if (open) {
            setValue(getApiKey() ?? '');
            setModelState(getModel());
            setSaved(false);
        }
    }, [open]);

    if (!open) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        setApiKey(value);
        setModel(model);
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
            className="fixed inset-0 z-[200] flex items-stretch sm:items-center justify-center bg-black/80 p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl border-2 border-current bg-black p-4 sm:p-6 text-sm sm:text-base max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto terminal-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 gap-2">
                    <h2 className="tracking-wider truncate text-base sm:text-xl">/// SETTINGS ///</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close settings"
                        className="shrink-0 border-2 border-current px-2 py-0.5 sm:px-3 sm:py-1 hover:bg-green-900/50"
                    >
                        [ X ]
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <label className="block">
                        <span className="block mb-2 text-xs sm:text-sm tracking-wider">GOOGLE GEMINI API KEY:</span>
                        <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">
                            <input
                                type={reveal ? 'text' : 'password'}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Paste your key (e.g. AIza...)"
                                className="w-full sm:flex-1 min-w-0 bg-transparent border-2 border-current px-3 py-2 focus:outline-none placeholder-green-800 text-sm"
                                autoComplete="off"
                                spellCheck={false}
                                aria-label="Gemini API key"
                            />
                            <button
                                type="button"
                                onClick={() => setReveal((r) => !r)}
                                className="self-start sm:self-auto shrink-0 border-2 border-current px-3 py-2 hover:bg-green-900/50 text-xs"
                                aria-label={reveal ? 'Hide API key' : 'Show API key'}
                            >
                                {reveal ? '[ HIDE ]' : '[ SHOW ]'}
                            </button>
                        </div>
                    </label>

                    <fieldset className="border-2 border-current p-3">
                        <legend className="px-2 text-xs tracking-wider">MODEL</legend>
                        <p className="text-xs sm:text-sm leading-relaxed break-words">
                            <span className="text-green-300">gemini-3.5-flash</span> — newest &amp; fastest,
                            snappy terminal feel.
                        </p>
                    </fieldset>

                    <div className="border-2 border-current p-3 sm:p-4 space-y-3 text-xs sm:text-sm leading-relaxed text-green-500/90 break-words">
                        <div>
                            <p className="text-green-300 tracking-wider mb-1">/// YOUR KEY, YOUR SESSION ///</p>
                            <p>
                                Your API key is stored ONLY in this browser tab's session memory.
                                It is never sent to any Hawkins Frequency server, never written to
                                disk, never shared across tabs or visitors, and is wiped the moment
                                you close this tab. Other people using the app cannot see or reuse
                                your key — each visitor must bring their own.
                            </p>
                        </div>

                        <div>
                            <p className="text-green-300 tracking-wider mb-1">/// COST ///</p>
                            <p>
                                Google AI Studio offers a generous free tier for{' '}
                                <code className="text-green-300">gemini-3.5-flash</code> that
                                covers casual chat (rate-limited per minute/day, no card required).
                                Beyond the free tier, typical chat turns cost a small fraction of a
                                cent each — a long evening of questions is usually well under $1.
                                Check{' '}
                                <a
                                    href="https://ai.google.dev/pricing"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="underline hover:bg-green-900/50"
                                >
                                    Google's current pricing
                                </a>{' '}
                                for exact rates.
                            </p>
                        </div>

                        <div>
                            <p className="text-green-300 tracking-wider mb-1">/// GET A KEY ///</p>
                            <p>
                                Grab a free API key at{' '}
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="underline hover:bg-green-900/50 break-all"
                                >
                                    aistudio.google.com/app/apikey
                                </a>
                                .
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 pt-1">
                        <button
                            type="submit"
                            className="border-2 border-current px-4 py-2 hover:bg-green-900/50 disabled:opacity-50 text-xs sm:text-sm tracking-wider"
                            disabled={!value.trim()}
                        >
                            [ SAVE ]
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="border-2 border-current px-4 py-2 hover:bg-green-900/50 text-xs sm:text-sm tracking-wider"
                        >
                            [ CLEAR ]
                        </button>
                        {saved && <span className="self-center text-xs sm:text-sm">// SAVED //</span>}
                    </div>
                </form>
            </div>

        </div>
    );
};

export default SettingsModal;
