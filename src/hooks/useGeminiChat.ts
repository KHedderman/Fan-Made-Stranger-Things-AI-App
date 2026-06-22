import { useEffect, useState, useCallback } from 'react';
import { GoogleGenAI, type Chat } from '@google/genai';
import { getSystemInstruction } from '../constants';
import type { Mode, Season } from '../types';
import { getApiKey, getModel } from '../lib/apiKeyStorage';

export class MissingApiKeyError extends Error {
    constructor() {
        super('Missing Gemini API key. Add one in Settings.');
        this.name = 'MissingApiKeyError';
    }
}

export const useGeminiChat = () => {
    const [hasApiKey, setHasApiKey] = useState<boolean>(() => !!getApiKey());

    useEffect(() => {
        const sync = () => setHasApiKey(!!getApiKey());
        window.addEventListener('hawkins-apikey-changed', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('hawkins-apikey-changed', sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const startChat = useCallback((mode: Mode, season: Season): Chat => {
        const key = getApiKey();
        if (!key) {
            throw new MissingApiKeyError();
        }
        const ai = new GoogleGenAI({ apiKey: key });
        const systemInstruction = getSystemInstruction(mode, season);
        return ai.chats.create({
            model: getModel(),
            config: {
                systemInstruction,
                temperature: 0.6,
            },
        });
    }, []);

    return { startChat, hasApiKey };
};
