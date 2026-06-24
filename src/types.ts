export type Mode = 'child' | 'adult';

export type Season = '1' | '2' | '3' | '4' | '5' | 'First Shadow' | "Tales from '85";

export type AppState = 'BOOTING' | 'CHATTING';

export interface GeneratedImageData {
    prompt: string;
    dataUrl?: string;       // populated when the image finishes rendering
    status: 'pending' | 'ready' | 'error';
    error?: string;
}

export interface Message {
    id: number;
    sender: 'user' | 'ai' | 'system';
    text: string;
    images?: GeneratedImageData[];
    /** Show an animated pixel-art waving avatar above the message text. */
    avatar?: 'eleven' | 'dustin';
}
