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

                    <fieldset className="border-2 border-current p-3">
                        <legend className="px-2">MODEL</legend>
                        <p className="text-base md:text-lg leading-snug">
                            gemini-3.5-flash — newest & fastest, snappy terminal feel.
                        </p>
                    </fieldset>

                    <div className="border-2 border-current p-3 space-y-2 text-base md:text-lg leading-snug text-green-500/90">
                        <p>
                            <span className="text-green-300">/// YOUR KEY, YOUR SESSION ///</span>
                        </p>
                        <p>
                            Your API key is stored ONLY in this browser tab's session memory.
                            It is never sent to any Hawkins Frequency server, never written to
                            disk, never shared across tabs or visitors, and is wiped the moment
                            you close this tab. Other people using the app cannot see or reuse
                            your key — each visitor must bring their own.
                        </p>
                        <p>
                            <span className="text-green-300">/// COST ///</span> Google AI
                            Studio offers a generous free tier for{' '}
                            <code>gemini-3.5-flash</code> that covers casual chat (rate-limited
                            per minute/day, no card required). Beyond the free tier, typical
                            chat turns cost a small fraction of a cent each — a long evening
                            of questions is usually well under $1. Check{' '}
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
                        <p>
                            Get a free API key at{' '}
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="underline hover:bg-green-900/50"
                            >
                                Google AI Studio
                            </a>
                            .
                        </p>
                    </div>

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
