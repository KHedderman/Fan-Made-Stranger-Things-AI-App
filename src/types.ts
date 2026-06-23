export type Mode = 'child' | 'adult';

export type Season = '1' | '2' | '3' | '4' | '5' | 'First Shadow' | "Tales from '85";

export type AppState = 'BOOTING' | 'CHATTING';

export interface Message {
    id: number;
    sender: 'user' | 'ai' | 'system';
    text: string;
}
