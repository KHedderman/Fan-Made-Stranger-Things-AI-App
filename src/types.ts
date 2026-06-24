export type Mode = 'child' | 'adult';

export type Season = '1' | '2' | '3' | '4' | '5' | 'First Shadow' | "Tales from '85";

export type AppState = 'BOOTING' | 'CHATTING';

export interface GeneratedImageData {
    prompt: string;
    dataUrl?: string;
    status: 'pending' | 'ready' | 'error';
    error?: string;
}

export interface GeneratedAsciiData {
    subject: string;
    art?: string;
    status: 'pending' | 'ready' | 'error';
    error?: string;
}

export interface Message {
    id: number;
    sender: 'user' | 'ai' | 'system';
    text: string;
    images?: GeneratedImageData[];
    asciiArts?: GeneratedAsciiData[];
}
