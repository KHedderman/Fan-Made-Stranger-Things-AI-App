
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types.ts';
import { UserIcon, LoadingIcon } from './icons.tsx';
import { playKeyClick } from '../lib/keyClickSound';
import PixelAvatar from './PixelAvatar';

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (input: string) => void;
    isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        // Scroll only the messages container, not the whole page — using
        // scrollIntoView would bubble up and shift the CRT footer/header.
        const end = messagesEndRef.current;
        const container = end?.parentElement as HTMLElement | null;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    const renderMessage = (msg: Message, index: number) => {
        const isUser = msg.sender === 'user';
        const isSystem = msg.sender === 'system';
        const isAi = msg.sender === 'ai';

        const isLastMessageInArray = index === messages.length - 1;
        // The blinking cursor should appear on the last AI message, whether it's loading or complete.
        const showBlinkingCursor = isLastMessageInArray && isAi;

        return (
            <div key={msg.id} className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
                {isUser && <UserIcon />}
                <div className={`max-w-[90%] ${isUser ? 'text-right' : ''} ${isSystem ? 'text-amber-400 text-center w-full' : ''}`}>
                    <p className="whitespace-pre-wrap">
                        {msg.text}
                        {showBlinkingCursor && <span className="animate-pulse ml-1">▌</span>}
                    </p>
                    {msg.images && msg.images.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {msg.images.map((img, i) => (
                                <figure
                                    key={i}
                                    className="border border-[rgba(51,255,102,0.5)] bg-black/60 p-2 inline-block max-w-full"
                                >
                                    {img.status === 'ready' && img.dataUrl ? (
                                        <img
                                            src={img.dataUrl}
                                            alt={img.prompt}
                                            loading="lazy"
                                            className="block max-w-[320px] w-full h-auto"
                                            style={{
                                                imageRendering: 'pixelated',
                                                filter: 'sepia(1) hue-rotate(70deg) saturate(6) brightness(1.05) contrast(1.1)',
                                            }}
                                        />
                                    ) : img.status === 'error' ? (
                                        <div className="text-xs text-amber-400 px-3 py-6">
                                            /// IMAGE FEED LOST ///<br />
                                            {img.error ?? 'unknown error'}
                                        </div>
                                    ) : (
                                        <div className="text-xs px-3 py-6 animate-pulse">
                                            ░▒▓ RENDERING ON H-89 ▓▒░<br />
                                            <span className="opacity-70">"{img.prompt}"</span>
                                        </div>
                                    )}
                                    <figcaption className="text-[10px] mt-1 opacity-60 uppercase tracking-wider">
                                        &gt; nano_banana :: {img.prompt}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div
                className="flex-1 overflow-y-auto pr-2 space-y-6 terminal-scrollbar"
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
                aria-atomic="false"
                aria-label="Conversation"
            >
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="mt-4 flex items-center gap-2 sm:gap-4">
                <span className="text-lg sm:text-xl md:text-2xl shrink-0" aria-hidden="true">&gt;</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        const next = e.target.value;
                        if (next.length > input.length) playKeyClick();
                        setInput(next);
                    }}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-base sm:text-lg md:text-xl lg:text-2xl placeholder:text-[rgba(51,255,102,0.55)] min-w-0"
                    placeholder="Type your message and press Enter... (or type RESET)"
                    aria-label="Chat input"
                    disabled={isLoading}
                />
                {isLoading && <LoadingIcon />}
            </form>
        </div>
    );
};

export default ChatInterface;
