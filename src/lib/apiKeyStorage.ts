// BYOK: API key is persisted ONLY in the user's browser sessionStorage.
// It is cleared automatically when the tab is closed. It is never sent to
// any backend or third party other than Google's Gemini API directly from
// the browser. Do NOT migrate this to localStorage or any server store.
const STORAGE_KEY = 'hawkins_frequency_gemini_api_key';
const MODEL_KEY = 'hawkins_frequency_gemini_model';

export const SUPPORTED_MODELS = [
    {
        id: 'gemini-3.5-flash',
        label: 'Gemini 3.5 Flash — newest & fastest, snappy terminal feel',
    },
] as const;

export type GeminiModelId = (typeof SUPPORTED_MODELS)[number]['id'];
export const DEFAULT_MODEL: GeminiModelId = 'gemini-3.5-flash';

const storage = (): Storage | null => {
    if (typeof window === 'undefined') return null;
    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
};

export const getApiKey = (): string | null => {
    try {
        return storage()?.getItem(STORAGE_KEY) ?? null;
    } catch {
        return null;
    }
};

export const setApiKey = (key: string): void => {
    try {
        storage()?.setItem(STORAGE_KEY, key.trim());
        window.dispatchEvent(new Event('hawkins-apikey-changed'));
    } catch {
        // ignore
    }
};

export const clearApiKey = (): void => {
    try {
        storage()?.removeItem(STORAGE_KEY);
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem(STORAGE_KEY);
            } catch {
                /* ignore */
            }
        }
        window.dispatchEvent(new Event('hawkins-apikey-changed'));
    } catch {
        // ignore
    }
};

export const getModel = (): GeminiModelId => {
    return DEFAULT_MODEL;
};

export const setModel = (_model: GeminiModelId): void => {
    try {
        storage()?.setItem(MODEL_KEY, DEFAULT_MODEL);
    } catch {
        /* ignore */
    }
};
