
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types.ts';
import { UserIcon, LoadingIcon } from './icons.tsx';
import { playKeyClick } from '../lib/keyClickSound';

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (input: string) => void;
    isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
                <p className={`max-w-[90%] whitespace-pre-wrap ${isUser ? 'text-right' : ''} ${isSystem ? 'text-amber-400 text-center w-full' : ''}`}>
                    {msg.text}
                    {showBlinkingCursor && <span className="animate-pulse ml-1">▌</span>}
                </p>
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
            <form onSubmit={handleSend} className="mt-4 flex items-center gap-4">
                <span className="text-3xl" aria-hidden="true">&gt;</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        const next = e.target.value;
                        if (next.length > input.length) playKeyClick();
                        setInput(next);
                    }}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-2xl md:text-3xl placeholder:text-[rgba(51,255,102,0.55)]"
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
