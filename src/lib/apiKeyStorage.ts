// BYOK: API key is persisted ONLY in the user's browser localStorage.
// It is never sent to any backend or third party other than Google's Gemini API directly from the browser.
const STORAGE_KEY = 'hawkins_frequency_gemini_api_key';

export const getApiKey = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

export const setApiKey = (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, key.trim());
        window.dispatchEvent(new Event('hawkins-apikey-changed'));
    } catch {
        // ignore
    }
};

export const clearApiKey = (): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event('hawkins-apikey-changed'));
    } catch {
        // ignore
    }
};
